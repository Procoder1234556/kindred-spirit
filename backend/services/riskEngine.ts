import { helius } from './helius'

// ─── Wallet Risk Score (Phase 2.1) ────────────────────────────────────────────
//
// Scores a wallet 0–100 based on heuristics from on-chain activity.
// Designed to be fast and not require a DB — all data comes from Helius RPC.

export interface WalletRiskResult {
  address: string
  score: number           // 0–100
  label: 'SAFE' | 'WATCH' | 'RISKY' | 'DANGEROUS'
  factors: WalletRiskFactors
  timestamp: number
}

export interface WalletRiskFactors {
  /** Wallet appears new — fewer than 5 historical transactions fetched */
  walletAge: number
  /** High number of distinct token interactions — common in rug deployers */
  highTokenDiversity: number
  /** Very low SOL balance relative to token count — dust wallet pattern */
  dustPattern: number
  /** Zero SOL balance — likely empty or drained */
  emptyBalance: number
  /** Large token balance count — potential airdrop farmer or MEV bot */
  airdropFarmer: number
  /** Large single-token inflow detected (token amount > 10,000 units) */
  largeInflow: number
  /** Raw factor total before cap */
  total: number
}

// ─── Risk Engine ──────────────────────────────────────────────────────────────

class WalletRiskEngine {
  /**
   * Score a wallet address 0–100.
   * Weighted factors:
   *   1. walletAge        — new wallet = higher risk
   *   2. highTokenDiversity — scatter pattern common in ruggers/bots
   *   3. dustPattern      — low SOL + many tokens
   *   4. emptyBalance     — drained wallet
   *   5. airdropFarmer    — 50+ token accounts
   *   6. largeInflow      — single token balance > 10,000 units
   * Returns null if the address cannot be resolved via Helius.
   */
  async score(address: string): Promise<WalletRiskResult | null> {
    const [info, txHistory] = await Promise.all([
      helius.getAccountInfo(address),
      helius.getTransactionHistory(address, 5),
    ])
    if (!info) return null

    const factors: WalletRiskFactors = {
      walletAge: 0,
      highTokenDiversity: 0,
      dustPattern: 0,
      emptyBalance: 0,
      airdropFarmer: 0,
      largeInflow: 0,
      total: 0,
    }

    let raw = 0

    // ── Factor 1: Wallet age — fewer than 5 historical txns = newly created ──
    if (txHistory.length < 5) {
      raw += 20
      factors.walletAge = 20
    }

    // ── Factor 2: Zero / near-zero SOL balance ────────────────────────────────
    if (info.balance === 0) {
      raw += 25
      factors.emptyBalance = 25
    }

    // ── Factor 3: Dust wallet — low SOL + many tokens ─────────────────────────
    const tokenCount = info.tokenBalances.length
    if (info.balance < 0.05 && tokenCount > 5) {
      raw += 20
      factors.dustPattern = 20
    }

    // ── Factor 4: High token diversity — common in rug deployers / MEV bots ──
    if (tokenCount > 30) {
      raw += 25
      factors.highTokenDiversity = 25
    } else if (tokenCount > 15) {
      raw += 10
      factors.highTokenDiversity = 10
    }

    // ── Factor 5: Airdrop farmer / bot pattern ────────────────────────────────
    if (tokenCount > 50) {
      raw += 10
      factors.airdropFarmer = 10
    }

    // ── Factor 6: Large inflow — any token balance exceeding 10,000 units ─────
    const hasLargeInflow = info.tokenBalances.some((t) => t.amount > 10_000)
    if (hasLargeInflow) {
      raw += 15
      factors.largeInflow = 15
    }

    const total = Math.min(raw, 100)
    factors.total = total

    return {
      address,
      score: total,
      label: riskLabel(total),
      factors,
      timestamp: Date.now(),
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskLabel(score: number): WalletRiskResult['label'] {
  if (score >= 75) return 'DANGEROUS'
  if (score >= 50) return 'RISKY'
  if (score >= 25) return 'WATCH'
  return 'SAFE'
}

// Singleton
export const walletRiskEngine = new WalletRiskEngine()
