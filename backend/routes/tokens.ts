import { Router } from 'express'
import { helius } from '../services/helius'

const router = Router()

/**
 * GET /api/tokens/:mint
 * Returns token metadata + rug risk score.
 */
router.get('/:mint', async (req, res) => {
  const { mint } = req.params
  if (!mint || mint.length < 32) {
    res.status(400).json({ error: 'Invalid mint address' })
    return
  }

  const [metadata, rugAnalysis] = await Promise.all([
    helius.getTokenMetadata(mint),
    helius.computeRugScore(mint),
  ])

  if (!metadata) {
    res.status(404).json({ error: 'Token not found' })
    return
  }

  res.json({
    ...metadata,
    rugRisk: rugAnalysis,
    timestamp: Date.now(),
  })
})

export default router
