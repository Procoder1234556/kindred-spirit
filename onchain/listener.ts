// @ts-nocheck
/* eslint-disable */
/**
 * SolanaListener — Helius Enhanced WebSocket listener.
 * ts-nocheck is intentional: ws types are resolved from backend/node_modules
 * at runtime but TypeScript cannot cross-resolve them in the monorepo tsconfig.
 */
import { EventEmitter } from 'events'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const WebSocket = require('ws')
import { config } from '../backend/config'
import type { RawTransactionEvent } from '../backend/services/signalEngine'

/**
 * SolanaListener — connects to Helius Enhanced WebSocket and
 * emits structured RawTransactionEvent objects for every confirmed tx.
 *
 * Supports auto-reconnect with exponential backoff.
 */
export class SolanaListener extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectDelay = 1000
  private maxReconnectDelay = 30_000
  private reconnectTimer: NodeJS.Timeout | null = null
  private subscriptionId: number | null = null
  private isShuttingDown = false
  private pingInterval: NodeJS.Timeout | null = null

  connect(): void {
    if (config.MOCK_MODE) {
      console.warn('🛠️  Running in MOCK_MODE: Generating simulated Solana transactions.')
      this.startMockGenerator()
      return
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) return

    console.log(`🔌 Connecting to Helius WebSocket...`)
    this.ws = new WebSocket(config.HELIUS_WS_URL)

    this.ws.on('open', () => {
      console.log('✅ Helius WebSocket connected')
      this.reconnectDelay = 1000 // Reset backoff
      this.subscribeToTransactions()
      this.startPing()
    })

    this.ws.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString())
        this.handleMessage(msg)
      } catch {
        // Ignore parse errors
      }
    })

    this.ws.on('error', (err: Error) => {
      console.error('❌ WebSocket error:', err.message)
    })

    this.ws.on('close', (code: number, reason: Buffer) => {
      console.warn(`⚠️  WebSocket closed [${code}]: ${reason.toString()}`)
      this.cleanup()
      if (!this.isShuttingDown) {
        this.scheduleReconnect()
      }
    })
  }

  disconnect(): void {
    this.isShuttingDown = true
    this.cleanup()
    this.ws?.close()
    this.ws = null
    console.log('🔌 Listener disconnected')
  }

  private subscribeToTransactions(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    // Subscribe to all transactions (Helius Enhanced Transactions)
    const subscribeMsg = {
      jsonrpc: '2.0',
      id: 1,
      method: 'transactionSubscribe',
      params: [
        {
          accountInclude: [], // Empty = all accounts
          failed: false,
          vote: false,
        },
        {
          commitment: 'confirmed',
          encoding: 'jsonParsed',
          transactionDetails: 'full',
          showRewards: false,
          maxSupportedTransactionVersion: 0,
        },
      ],
    }

    this.ws.send(JSON.stringify(subscribeMsg))
    console.log('📡 Subscribed to Solana transaction stream')
  }

  private handleMessage(msg: Record<string, unknown>): void {
    // Store subscription ID
    if (msg.id === 1 && msg.result !== undefined) {
      this.subscriptionId = msg.result as number
      console.log(`📋 Subscription ID: ${this.subscriptionId}`)
      return
    }

    // Handle incoming notifications
    if (msg.method === 'transactionNotification') {
      const params = msg.params as Record<string, unknown>
      const value = params?.result as Record<string, unknown>
      if (value) {
        const event = this.parseTransaction(value)
        if (event) {
          this.emit('transaction', event)
        }
      }
    }
  }

  private parseTransaction(
    value: Record<string, unknown>
  ): RawTransactionEvent | null {
    try {
      const tx = value.transaction as Record<string, unknown>
      const meta = tx?.meta as Record<string, unknown>
      const transaction = tx?.transaction as Record<string, unknown>
      const message = transaction?.message as Record<string, unknown>

      if (!meta || !message) return null

      const accountKeys = (
        (message.accountKeys as Array<{ pubkey: string }>) ?? []
      ).map((k) => k.pubkey)

      const preBalances = (meta.preBalances as number[]) ?? []
      const postBalances = (meta.postBalances as number[]) ?? []

      // Build native transfers from balance changes
      const nativeTransfers: RawTransactionEvent['nativeTransfers'] = []
      for (let i = 0; i < accountKeys.length; i++) {
        const diff = (postBalances[i] ?? 0) - (preBalances[i] ?? 0)
        if (diff < 0) {
          // Find recipient
          for (let j = 0; j < accountKeys.length; j++) {
            const recv = (postBalances[j] ?? 0) - (preBalances[j] ?? 0)
            if (recv > 0 && Math.abs(diff) - recv < 10_000) {
              nativeTransfers.push({
                fromUserAccount: accountKeys[i],
                toUserAccount: accountKeys[j],
                amount: recv,
              })
            }
          }
        }
      }

      // Token transfers
      const preTokenBalances = (
        meta.preTokenBalances as Array<{
          accountIndex: number
          mint: string
          uiTokenAmount: { uiAmount: number | null }
          owner: string
        }>
      ) ?? []
      const postTokenBalances = (
        meta.postTokenBalances as typeof preTokenBalances
      ) ?? []

      const tokenTransfers: RawTransactionEvent['tokenTransfers'] = []
      for (const post of postTokenBalances) {
        const pre = preTokenBalances.find(
          (p) => p.accountIndex === post.accountIndex
        )
        const preAmt = pre?.uiTokenAmount.uiAmount ?? 0
        const postAmt = post.uiTokenAmount.uiAmount ?? 0
        const delta = postAmt - preAmt
        if (Math.abs(delta) > 0) {
          tokenTransfers.push({
            fromUserAccount: accountKeys[post.accountIndex] ?? '',
            toUserAccount: '',
            fromTokenAccount: accountKeys[post.accountIndex] ?? '',
            toTokenAccount: '',
            tokenAmount: Math.abs(delta),
            mint: post.mint,
          })
        }
      }

      // Classify tx type from logs
      const logMessages = (meta.logMessages as string[]) ?? []
      const type = this.classifyTxType(logMessages, accountKeys)
      const source = this.classifySource(accountKeys)

      return {
        signature: (value.signature as string) ?? '',
        slot: (value.slot as number) ?? 0,
        blockTime: (tx.blockTime as number | null) ?? null,
        fee: (meta.fee as number) ?? 0,
        accounts: accountKeys,
        instructions:
          (message.instructions as RawTransactionEvent['instructions']) ?? [],
        tokenTransfers,
        nativeTransfers,
        type,
        source,
      }
    } catch {
      return null
    }
  }

  private classifyTxType(
    logs: string[],
    accounts: string[]
  ): string | undefined {
    const logStr = logs.join(' ').toLowerCase()
    if (logStr.includes('remove_liquidity') || logStr.includes('removeliquidity'))
      return 'REMOVE_LIQUIDITY'
    if (logStr.includes('add_liquidity') || logStr.includes('addliquidity'))
      return 'ADD_LIQUIDITY'
    if (logStr.includes('swap')) return 'SWAP'
    if (logStr.includes('mint')) return 'MINT'
    if (logStr.includes('transfer')) return 'TRANSFER'
    return undefined
  }

  private classifySource(accounts: string[]): string | undefined {
    const KNOWN_PROGRAMS: Record<string, string> = {
      JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: 'JUPITER',
      '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'RAYDIUM',
      whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc: 'ORCA',
      metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s: 'METAPLEX',
    }
    for (const addr of accounts) {
      if (KNOWN_PROGRAMS[addr]) return KNOWN_PROGRAMS[addr]
    }
    return undefined
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping()
      }
    }, 30_000)
  }

  private cleanup(): void {
    if (this.pingInterval) clearInterval(this.pingInterval)
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.subscriptionId = null
  }

  private scheduleReconnect(): void {
    const delay = this.reconnectDelay
    console.log(`🔁 Reconnecting in ${delay / 1000}s...`)
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2,
      this.maxReconnectDelay
    )
  }

  private startMockGenerator(): void {
    setInterval(() => {
      const types = ['SWAP', 'WHALE_MOVE', 'REMOVE_LIQUIDITY', 'MINT']
      const type = types[Math.floor(Math.random() * types.length)]
      const mockEvent: RawTransactionEvent = {
        signature: Math.random().toString(36).substring(2, 15),
        slot: 250000000 + Math.floor(Math.random() * 1000),
        blockTime: Math.floor(Date.now() / 1000),
        fee: 5000,
        accounts: [
          '8x4aFp8p9m2sR41p9m2sR41p9m2sR41p',
          '3vR2KzL1M9m2sP41p9m2sR41p9m2sR41p',
        ],
        instructions: [],
        tokenTransfers: [],
        nativeTransfers: [],
        type: type === 'WHALE_MOVE' ? 'TRANSFER' : type,
        source: ['JUPITER', 'RAYDIUM', 'ORCA'][Math.floor(Math.random() * 3)],
      }

      if (type === 'WHALE_MOVE') {
        mockEvent.nativeTransfers.push({
          fromUserAccount: 'Whale' + Math.floor(Math.random() * 100),
          toUserAccount: 'ExchangeHotWallet',
          amount: (10000 + Math.random() * 50000) * 1e9,
        })
      } else if (type === 'REMOVE_LIQUIDITY') {
        mockEvent.tokenTransfers.push({
          fromUserAccount: 'DeployerX',
          toUserAccount: '',
          fromTokenAccount: '',
          toTokenAccount: '',
          tokenAmount: 85 + Math.random() * 15,
          mint: 'RugToken' + Math.floor(Math.random() * 1000),
        })
      } else {
        // Regular swap
        mockEvent.tokenTransfers.push({
          fromUserAccount: 'UserA',
          toUserAccount: 'UserB',
          fromTokenAccount: '',
          toTokenAccount: '',
          tokenAmount: 500 + Math.random() * 5000,
          mint: 'So11111111111111111111111111111111111111112',
        })
      }

      this.emit('transaction', mockEvent)
    }, 10000)
  }
}

export const solanaListener = new SolanaListener()
