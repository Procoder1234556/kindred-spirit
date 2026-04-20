import { Router } from 'express'
import { helius } from '../services/helius'
import { walletRiskEngine } from '../services/riskEngine'

const router = Router()

/**
 * GET /api/wallets/:address
 * Returns wallet summary: SOL balance, token balances, recent transactions,
 * and wallet risk score (Phase 2.1).
 */
router.get('/:address', async (req, res) => {
  const { address } = req.params
  if (!address || address.length < 32) {
    res.status(400).json({ error: 'Invalid Solana address' })
    return
  }

  const [accountInfo, txHistory, riskResult] = await Promise.all([
    helius.getAccountInfo(address),
    helius.getTransactionHistory(address, 10),
    walletRiskEngine.score(address),
  ])

  if (!accountInfo) {
    res.status(404).json({ error: 'Wallet not found or RPC error' })
    return
  }

  res.json({
    address,
    balance: accountInfo.balance,
    tokenBalances: accountInfo.tokenBalances,
    recentTransactions: txHistory,
    risk: riskResult
      ? {
          score: riskResult.score,
          label: riskResult.label,
          factors: riskResult.factors,
        }
      : null,
    timestamp: Date.now(),
  })
})

export default router
