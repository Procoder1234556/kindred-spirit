import { Router } from 'express'
import { helius } from '../services/helius'
import { redis } from '../services/redis'

const router = Router()

/**
 * GET /api/metrics
 * Returns live network stats: TPS, SOL price, TVL (simulated), alert counts.
 * Responses are cached in Redis for 15 seconds.
 */
router.get('/', async (_req, res) => {
  // Try cache first
  const cached = await redis.getMetrics()
  if (cached) {
    res.json({ ...cached, cached: true })
    return
  }

  // Fetch live data in parallel
  const [tps, solPrice, signals] = await Promise.all([
    helius.getTPS(),
    helius.getSolPrice(),
    redis.getRecentSignals(100),
  ])

  const alertCounts = {
    total: signals.length,
    WHALE_MOVE: signals.filter((s) => s.type === 'WHALE_MOVE').length,
    RUG_RISK: signals.filter((s) => s.type === 'RUG_RISK').length,
    LIQUIDITY_SHIFT: signals.filter((s) => s.type === 'LIQUIDITY_SHIFT').length,
    MARKET_SIGNAL: signals.filter((s) => s.type === 'MARKET_SIGNAL').length,
    CRITICAL: signals.filter((s) => s.severity === 'CRITICAL').length,
  }

  // Simulated TVL until real data pipeline is wired
  const tvlMonitored = 1_200_000_000 + Math.random() * 50_000_000

  const metrics = {
    tps,
    solPrice,
    tvlMonitored: Math.round(tvlMonitored),
    alertCounts,
    timestamp: Date.now(),
    cached: false,
  }

  await redis.setMetrics(metrics)
  res.json(metrics)
})

export default router
