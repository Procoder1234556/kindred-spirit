import { Router } from 'express'
import { redis } from '../services/redis'
import type { Signal } from '../services/signalEngine'

const router = Router()

/**
 * GET /api/signals
 * Returns the last N signals from Redis cache.
 * Query params:
 *   - limit (default 50, max 100)
 *   - type (WHALE_MOVE | RUG_RISK | LIQUIDITY_SHIFT | MARKET_SIGNAL)
 *   - severity (LOW | MEDIUM | HIGH | CRITICAL)
 */
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
  const typeFilter = req.query.type as Signal['type'] | undefined
  const severityFilter = req.query.severity as Signal['severity'] | undefined

  const signals = await redis.getRecentSignals(100)

  let filtered = signals
  if (typeFilter) {
    filtered = filtered.filter((s) => s.type === typeFilter)
  }
  if (severityFilter) {
    filtered = filtered.filter((s) => s.severity === severityFilter)
  }

  res.json({
    signals: filtered.slice(0, limit),
    total: filtered.length,
    timestamp: Date.now(),
  })
})

/**
 * GET /api/signals/:id
 * Returns a specific signal by ID.
 */
router.get('/:id', async (req, res) => {
  const signals = await redis.getRecentSignals(100)
  const signal = signals.find((s) => s.id === req.params.id)
  if (!signal) {
    res.status(404).json({ error: 'Signal not found' })
    return
  }
  res.json(signal)
})

export default router
