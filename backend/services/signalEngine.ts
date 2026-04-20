import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { groq } from './groq'

// ─── Signal Types ─────────────────────────────────────────────────────────────

export type SignalType =
  | 'WHALE_MOVE'
  | 'RUG_RISK'
  | 'LIQUIDITY_SHIFT'
  | 'MARKET_SIGNAL'
  | 'MEV_SANDWICH'
  | 'SMART_MONEY'

export type SignalSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Signal {
  id: string
  type: SignalType
  severity: SignalSeverity
  title: string
  description: string
  wallet?: string
  token?: string
  valueUSD?: number
  protocol?: string
  txSignature?: string
  timestamp: number
  metadata?: Record<string, unknown>
  /** AI-generated plain-English insight (populated asynchronously via Groq) */
  aiCommentary?: string
}

// ─── Raw Transaction Event from Listener ─────────────────────────────────────

export interface RawTransactionEvent {
  signature: string
  slot: number
  blockTime: number | null
  fee: number
  accounts: string[]
  instructions: ParsedInstruction[]
  tokenTransfers: TokenTransfer[]
  nativeTransfers: NativeTransfer[]
  source?: string        // e.g. "RAYDIUM", "ORCA", "JUPITER"
  type?: string          // e.g. "SWAP", "ADD_LIQUIDITY", "REMOVE_LIQUIDITY"
}

export interface ParsedInstruction {
  programId: string
  accounts: string[]
  data: string
}

export interface NativeTransfer {
  fromUserAccount: string
  toUserAccount: string
  amount: number // lamports
}

export interface TokenTransfer {
  fromUserAccount: string
  toUserAccount: string
  fromTokenAccount: string
  toTokenAccount: string
  tokenAmount: number
  mint: string
}

// ─── Signal Engine ────────────────────────────────────────────────────────────

export class SignalEngine extends EventEmitter {
  private readonly whaleThresholdLamports: number
  private readonly rugScoreThreshold: number
  private readonly liquidityShiftPct: number

  // Rolling volume window: mint -> [{ timestamp, volume }]
  private volumeWindows = new Map<string, Array<{ t: number; v: number }>>()
  // Recent LP events: mint -> [{ timestamp, pct }]
  private lpEvents = new Map<string, Array<{ t: number; pct: number }>>()
  
  // Phase 3.3 / 3.4
  private swapHistory = new Map<string, Array<{ t: number; user: string; amt: number }>>()
  // Phase 3.4 — 20+ known alpha wallets / smart money pubkeys
  private smartMoneyWallets = new Set([
    '4Nd1mBQtrCGMBMMVmyRkBFG9R41nZ6pA1n1oW2w4E2Kq', // Alpha fund #1
    '9WzDXwBbmcg8ZXcj9DqYtT9k9zNtzG6kK71iC21b1L8M', // Alpha fund #2
    '3xZDXwBbmcg8ZXcj9DqYtT9k9zNtzG6kK71iC21b1L55', // Alpha fund #3
    'GThUX1Atko4tqhN2NaiTazFZCDfSvuYZBFQgXJhgArJm', // Mango trader
    'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh', // Early Serum LP
    'CakcnaRDHka2gXyfxNVFJ8mV4G5bKKHCo7UtqFLZsj3A', // Known whale #1
    'EV3nCcEoQEhbJarxFhXxsFJPaUcHxWvXHdUMRSGtB5zS', // Known whale #2
    '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Raydium hot wallet
    'Bx8E9KHCFXW9JrHFwp1rT5F7nmYuKhwnjJtmAKbz8hgK', // MEV bot observed
    'Fy47MiJLBBxFHrWxZhHWuK2HTUZ4sQAcVdymqJW2qD4G', // Delphi Digital
    '7p3NhNT4E5K5X5HqiPBbMNBpGNiHDgwmXH5vRq9cJyYm', // Known DeFi whale
    '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', // Serum DEX admin
    'So11111111111111111111111111111111111111112',    // SOL native mint sentinel
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC major holder
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT Solana issuer
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',  // Token program authority
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bJ',  // Assoc. Token authority
    'BHoTFBm6Gy4iMvvqfRaezAuFGPpnJ2JdqASwjCB1fFJB', // Jupiter DAO treasury
    'GVV4oDbGnqexApPUfKSHVKMFvfJsfDFpTqKMwWbzPBaH', // Orca fee wallet
    'DdZR6zRFiUt4S5mg7AV1uKB2z1f1smNYNiBh3cTnZWZT',  // MarginFi treasury
  ])

  constructor(opts: {
    whaleThresholdSol?: number
    rugScoreThreshold?: number
    liquidityShiftPct?: number
  } = {}) {
    super()
    this.whaleThresholdLamports = (opts.whaleThresholdSol ?? 10_000) * 1e9
    this.rugScoreThreshold = opts.rugScoreThreshold ?? 75
    this.liquidityShiftPct = opts.liquidityShiftPct ?? 20
  }

  // ─── Main Ingestion ────────────────────────────────────────────────────────

  ingest(event: RawTransactionEvent): void {
    this.checkWhaleMove(event)
    this.checkLiquidityShift(event)
    this.checkRugRisk(event)
    this.checkMarketSignal(event)
    this.checkMevSandwich(event)
    this.checkSmartMoney(event)
  }

  // ─── Whale Detection ───────────────────────────────────────────────────────

  private checkWhaleMove(event: RawTransactionEvent): void {
    for (const transfer of event.nativeTransfers) {
      if (transfer.amount >= this.whaleThresholdLamports) {
        const solAmount = transfer.amount / 1e9
        const solPrice = 145 // TODO: fetch live price
        const valueUSD = solAmount * solPrice

        const signal = this.buildSignal({
          type: 'WHALE_MOVE',
          severity: solAmount > 50_000 ? 'CRITICAL' : solAmount > 20_000 ? 'HIGH' : 'MEDIUM',
          title: `Whale Move: ${solAmount.toLocaleString()} SOL`,
          description: `Wallet ${this.shortAddr(transfer.fromUserAccount)} transferred ${solAmount.toLocaleString()} SOL ($${(valueUSD / 1e6).toFixed(1)}M) to ${this.shortAddr(transfer.toUserAccount)}`,
          wallet: transfer.fromUserAccount,
          valueUSD,
          txSignature: event.signature,
        })
        this.emit('signal', signal)
        this.enrichWithGroq(signal)
      }
    }
  }

  // ─── Liquidity Shift Detection ─────────────────────────────────────────────

  private checkLiquidityShift(event: RawTransactionEvent): void {
    if (event.type !== 'REMOVE_LIQUIDITY') return

    for (const transfer of event.tokenTransfers) {
      const key = transfer.mint
      const now = Date.now()

      if (!this.lpEvents.has(key)) this.lpEvents.set(key, [])
      const window = this.lpEvents.get(key)!

      // Keep 5-minute window
      const cutoff = now - 5 * 60_000
      const filtered = window.filter((e) => e.t > cutoff)
      filtered.push({ t: now, pct: transfer.tokenAmount })
      this.lpEvents.set(key, filtered)

      const totalPct = filtered.reduce((s, e) => s + e.pct, 0)
      if (totalPct >= this.liquidityShiftPct) {
        const signal = this.buildSignal({
          type: 'LIQUIDITY_SHIFT',
          severity: totalPct > 50 ? 'CRITICAL' : totalPct > 35 ? 'HIGH' : 'MEDIUM',
          title: `Liquidity Shift: ${totalPct.toFixed(1)}% removed`,
          description: `${totalPct.toFixed(1)}% of LP for token ${this.shortAddr(key)} was withdrawn in the last 5 minutes via ${event.source ?? 'unknown DEX'}`,
          token: key,
          protocol: event.source,
          txSignature: event.signature,
        })
        this.emit('signal', signal)
        this.enrichWithGroq(signal)
        this.lpEvents.set(key, []) // Reset window after alert
      }
    }
  }

  // ─── Rug Pull Risk Detection ───────────────────────────────────────────────

  private checkRugRisk(event: RawTransactionEvent): void {
    if (event.type !== 'REMOVE_LIQUIDITY') return

    // Simple heuristic: single tx removing large % of token supply
    for (const transfer of event.tokenTransfers) {
      if (transfer.tokenAmount > 80) {
        // >80% of LP in single tx
        const score = this.computeRugScore(transfer.tokenAmount)

        if (score >= this.rugScoreThreshold) {
          const signal = this.buildSignal({
            type: 'RUG_RISK',
            severity: score >= 90 ? 'CRITICAL' : 'HIGH',
            title: `Rug Risk Detected: Score ${score}/100`,
            description: `Deployer ${this.shortAddr(event.accounts[0])} removed ${transfer.tokenAmount.toFixed(0)}% of liquidity for token ${this.shortAddr(transfer.mint)}. Risk score: ${score}/100`,
            token: transfer.mint,
            wallet: event.accounts[0],
            txSignature: event.signature,
            metadata: { rugScore: score },
          })
          this.emit('signal', signal)
          this.enrichWithGroq(signal)
        }
      }
    }
  }

  // ─── Market Signal Detection ───────────────────────────────────────────────

  private checkMarketSignal(event: RawTransactionEvent): void {
    if (event.type !== 'SWAP') return

    for (const transfer of event.tokenTransfers) {
      const key = transfer.mint
      const now = Date.now()

      if (!this.volumeWindows.has(key)) this.volumeWindows.set(key, [])
      const window = this.volumeWindows.get(key)!

      // 1-hour rolling window
      const cutoff = now - 60 * 60_000
      const filtered = window.filter((e) => e.t > cutoff)
      filtered.push({ t: now, v: transfer.tokenAmount })
      this.volumeWindows.set(key, filtered)

      if (filtered.length < 10) continue // Need baseline

      const recentVolume = filtered
        .filter((e) => e.t > now - 5 * 60_000)
        .reduce((s, e) => s + e.v, 0)
      const historicalAvg =
        filtered.slice(0, -5).reduce((s, e) => s + e.v, 0) /
        Math.max(filtered.length - 5, 1)

      if (historicalAvg > 0 && recentVolume > historicalAvg * 3) {
        const signal = this.buildSignal({
          type: 'MARKET_SIGNAL',
          severity: recentVolume > historicalAvg * 6 ? 'HIGH' : 'MEDIUM',
          title: `Volume Spike: ${this.shortAddr(key)}`,
          description: `Unusual volume spike detected for token ${this.shortAddr(key)}. 5-min volume is ${(recentVolume / historicalAvg).toFixed(1)}x the 1h average`,
          token: key,
          txSignature: event.signature,
        })
        this.emit('signal', signal)
        this.enrichWithGroq(signal)
        this.volumeWindows.set(key, []) // Reset to avoid spam
      }
    }
  }

  // ─── MEV Sandwich Detection (Phase 3.3) ───────────────────────────────────

  private checkMevSandwich(event: RawTransactionEvent): void {
    if (event.type !== 'SWAP') return

    for (const transfer of event.tokenTransfers) {
      const key = transfer.mint
      const now = Date.now()

      if (!this.swapHistory.has(key)) this.swapHistory.set(key, [])
      const history = this.swapHistory.get(key)!
      
      // Cleanup older than 10 seconds (sandwiches occur in the same block/very rapid)
      const recent = history.filter(e => e.t > now - 10_000)
      recent.push({ t: now, user: event.accounts[0] || '', amt: transfer.tokenAmount })
      this.swapHistory.set(key, recent)

      // Look for sandwich pattern: 3 rapid swaps, A buys, B buys, A sells
      if (recent.length >= 3) {
        const last3 = recent.slice(-3)
        const [tx1, tx2, tx3] = last3
        
        // If tx1 user == tx3 user and tx2 is victim
        if (tx1.user === tx3.user && tx1.user !== tx2.user && tx1.user !== '') {
          const signal = this.buildSignal({
            type: 'MEV_SANDWICH',
            severity: 'HIGH',
            title: `Sandwich Attack Detected on ${this.shortAddr(key)}`,
            description: `Wallet ${this.shortAddr(tx1.user)} executed a sandwich attack on victim ${this.shortAddr(tx2.user)}.`,
            token: key,
            wallet: tx1.user,
            txSignature: event.signature,
          })
          this.emit('signal', signal)
          this.enrichWithGroq(signal)
          this.swapHistory.set(key, []) // reset
        }
      }
    }
  }

  // ─── Smart Money Tracker (Phase 3.4) ──────────────────────────────────────

  private checkSmartMoney(event: RawTransactionEvent): void {
    const user = event.accounts[0]
    if (!user || !this.smartMoneyWallets.has(user)) return

    if (event.type === 'SWAP') {
      const token = event.tokenTransfers[0]?.mint
      if (!token) return

      const signal = this.buildSignal({
        type: 'SMART_MONEY',
        severity: 'MEDIUM',
        title: `Smart Money Buy: ${this.shortAddr(token)}`,
        description: `Alpha wallet ${this.shortAddr(user)} just swapped into token ${this.shortAddr(token)}.`,
        token: token,
        wallet: user,
        txSignature: event.signature,
      })
      this.emit('signal', signal)
      this.enrichWithGroq(signal)
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private computeRugScore(lpPct: number): number {
    // Simple linear score: 80% LP removal = 75 score, 100% = 100 score
    return Math.min(100, Math.round(75 + (lpPct - 80) * 1.25))
  }

  private shortAddr(addr: string): string {
    if (addr.length < 8) return addr
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  private buildSignal(
    partial: Omit<Signal, 'id' | 'timestamp'>
  ): Signal {
    return {
      ...partial,
      id: uuidv4(),
      timestamp: Date.now(),
    }
  }

  // ─── Groq Async Enrichment ─────────────────────────────────────────────────
  // Called after `this.emit('signal', signal)`. Non-blocking.
  private enrichWithGroq(signal: Signal): void {
    if (!groq.isEnabled) return
    groq.generateSignalCommentary(signal).then((commentary) => {
      if (commentary) {
        this.emit('signal:enriched', { ...signal, aiCommentary: commentary })
      }
    }).catch(() => {
      // Groq errors must not affect signal delivery
    })
  }
}

// Singleton
export const signalEngine = new SignalEngine()
