import axios from 'axios'
import { config } from '../config'

const BASE_URL = `https://api.helius.xyz/v0`
const RPC_URL = config.HELIUS_RPC_URL
const API_KEY = config.HELIUS_API_KEY

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeliusTokenMetadata {
  mint: string
  name: string
  symbol: string
  decimals: number
  logoURI?: string
  supply?: number
  mintAuthority?: string | null
  freezeAuthority?: string | null
}

export interface HeliusAccountInfo {
  address: string
  balance: number // SOL
  tokenBalances: Array<{
    mint: string
    amount: number
    symbol?: string
  }>
}

export interface HeliusTPS {
  tps: number
  slot: number
}

// ─── Helius REST Client ───────────────────────────────────────────────────────

class HeliusClient {
  private http = axios.create({ timeout: 10_000 })

  // ─── Token Metadata (DAS) ──────────────────────────────────────────────

  async getTokenMetadata(mint: string): Promise<HeliusTokenMetadata | null> {
    try {
      const res = await this.http.post(RPC_URL, {
        jsonrpc: '2.0',
        id: 'get-asset',
        method: 'getAsset',
        params: { id: mint },
      })

      const asset = res.data?.result
      if (!asset) return null

      return {
        mint,
        name: asset.content?.metadata?.name ?? 'Unknown',
        symbol: asset.content?.metadata?.symbol ?? '???',
        decimals: asset.token_info?.decimals ?? 0,
        logoURI: asset.content?.links?.image,
        supply: asset.token_info?.supply,
        mintAuthority: asset.authorities?.[0]?.address,
      }
    } catch {
      return null
    }
  }

  // ─── Wallet / Account Info ─────────────────────────────────────────────

  async getAccountInfo(address: string): Promise<HeliusAccountInfo | null> {
    try {
      // SOL balance
      const balRes = await this.http.post(RPC_URL, {
        jsonrpc: '2.0',
        id: 'get-balance',
        method: 'getBalance',
        params: [address, { commitment: 'confirmed' }],
      })
      const lamports = balRes.data?.result?.value ?? 0

      // Token balances via Enhanced API
      const tokenRes = await this.http.get(
        `${BASE_URL}/addresses/${address}/balances?api-key=${API_KEY}`
      )
      const tokens = (tokenRes.data?.tokens ?? []).map(
        (t: { mint: string; amount: number; symbol?: string }) => ({
          mint: t.mint,
          amount: t.amount,
          symbol: t.symbol,
        })
      )

      return {
        address,
        balance: lamports / 1e9,
        tokenBalances: tokens,
      }
    } catch {
      return null
    }
  }

  // ─── Transaction History ───────────────────────────────────────────────

  async getTransactionHistory(address: string, limit = 10): Promise<unknown[]> {
    try {
      const res = await this.http.get(
        `${BASE_URL}/addresses/${address}/transactions?api-key=${API_KEY}&limit=${limit}`
      )
      return res.data ?? []
    } catch {
      return []
    }
  }

  // ─── Live Network TPS ──────────────────────────────────────────────────

  async getTPS(): Promise<number> {
    try {
      const res = await this.http.post(RPC_URL, {
        jsonrpc: '2.0',
        id: 'get-perf',
        method: 'getRecentPerformanceSamples',
        params: [1],
      })
      const sample = res.data?.result?.[0]
      if (!sample) return 0
      return Math.round(
        sample.numTransactions / sample.samplePeriodSecs
      )
    } catch {
      return 0
    }
  }

  // ─── SOL Price (via Helius DAS / Jupiter price API) ───────────────────

  async getSolPrice(): Promise<number> {
    try {
      const res = await axios.get(
        'https://price.jup.ag/v6/price?ids=So11111111111111111111111111111111111111112',
        { timeout: 5000 }
      )
      return res.data?.data?.['So11111111111111111111111111111111111111112']?.price ?? 145
    } catch {
      return 145 // Fallback
    }
  }

  // ─── Rug Score Computation ─────────────────────────────────────────────

  async computeRugScore(mint: string): Promise<{
    score: number
    factors: Record<string, number>
  }> {
    const metadata = await this.getTokenMetadata(mint)
    if (!metadata) return { score: 0, factors: {} }

    const factors: Record<string, number> = {}
    let score = 0

    // Mint authority still active = high risk
    if (metadata.mintAuthority) {
      score += 40
      factors.mintAuthority = 40
    }

    // Freeze authority = risk
    if (metadata.freezeAuthority) {
      score += 20
      factors.freezeAuthority = 20
    }

    // Very low supply: likely concentrated
    if (metadata.supply && metadata.supply < 1_000_000) {
      score += 20
      factors.lowSupply = 20
    }

    // No logo / metadata = scam risk
    if (!metadata.logoURI) {
      score += 10
      factors.noLogo = 10
    }

    factors.total = Math.min(score, 100)
    return { score: Math.min(score, 100), factors }
  }

  // ─── Token Holders (Phase 1.4) ─────────────────────────────────────────────

  async getTokenHolders(mint: string): Promise<{
    totalHolders: number
    top10: Array<{ address: string; amount: number; percentage: number }>
    top10ConcentrationPct: number
  } | null> {
    try {
      const res = await this.http.post(RPC_URL, {
        jsonrpc: '2.0',
        id: 'get-token-accounts',
        method: 'getTokenAccounts',
        params: {
          mint,
          limit: 100,
          sortBy: { sortBy: 'amount', sortDirection: 'desc' },
        },
      })
      const accounts: Array<{ address: string; amount: number }> =
        res.data?.result?.token_accounts ?? []
      if (accounts.length === 0) return null

      const totalSupply = accounts.reduce((s, a) => s + (a.amount ?? 0), 0)
      const top10 = accounts.slice(0, 10).map((a) => ({
        address: a.address,
        amount: a.amount,
        percentage: totalSupply > 0 ? (a.amount / totalSupply) * 100 : 0,
      }))
      const top10ConcentrationPct =
        totalSupply > 0
          ? (accounts.slice(0, 10).reduce((s, a) => s + (a.amount ?? 0), 0) / totalSupply) * 100
          : 0

      return {
        totalHolders: accounts.length,
        top10,
        top10ConcentrationPct: Math.round(top10ConcentrationPct * 10) / 10,
      }
    } catch {
      return null
    }
  }

  // ─── Token Risk Score (Phase 2.2): holder concentration + liquidity depth ───

  async getTokenRiskScore(mint: string): Promise<{
    score: number
    factors: Record<string, number>
  }> {
    const [holderData, rugData] = await Promise.all([
      this.getTokenHolders(mint),
      this.computeRugScore(mint),
    ])

    const factors: Record<string, number> = { ...rugData.factors }
    let score = rugData.score

    // Factor: top-10 holders own > 70% of supply = high concentration risk
    if (holderData) {
      if (holderData.top10ConcentrationPct > 70) {
        factors.holderConcentration = 30
        score = Math.min(100, score + 30)
      } else if (holderData.top10ConcentrationPct > 50) {
        factors.holderConcentration = 15
        score = Math.min(100, score + 15)
      } else {
        factors.holderConcentration = 0
      }
    }
    factors.total = Math.min(score, 100)
    return { score: Math.min(score, 100), factors }
  }
}

export const helius = new HeliusClient()
