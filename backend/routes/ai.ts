import { Router } from 'express'
import { helius } from '../services/helius'
import { redis } from '../services/redis'
import { groq } from '../services/groq'

const router = Router()

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIResponse {
  type: 'INFO' | 'ACTION' | 'ERROR'
  message: string
  data?: unknown
  actionType?: string
  aiPowered: boolean
}

// ─── POST /api/ai/command ─────────────────────────────────────────────────────
/**
 * Natural language command processor.
 * When Groq is configured: parses intent via LLM, then fetches real on-chain data.
 * Fallback: regex keyword heuristics (no AI key required).
 */
router.post('/command', async (req, res) => {
  const { prompt } = req.body

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    res.status(400).json({ error: 'No prompt provided' })
    return
  }

  const query = prompt.trim()

  try {
    // ─── Groq-powered path ────────────────────────────────────────────────────
    if (groq.isEnabled) {
      // Build light context from cached metrics
      const metrics = await redis.getMetrics()
      const context = metrics
        ? `Network TPS: ${metrics.tps}, SOL Price: $${metrics.solPrice}`
        : undefined

      const parsed = await groq.parseCommand(query, context)

      if (parsed) {
        const response = await executeIntent(parsed.intent, parsed.address, parsed.answer)
        res.json({ ...response, aiPowered: true })
        return
      }
      // If Groq parse failed, fall through to keyword heuristics
    }

    // ─── Keyword heuristic fallback ───────────────────────────────────────────
    const response = await keywordFallback(query)
    res.json({ ...response, aiPowered: false })

  } catch (err) {
    console.error('[AI /command] Error:', err)
    res.status(500).json({ error: 'AI command failed', aiPowered: false })
  }
})

// ─── GET /api/ai/digest ───────────────────────────────────────────────────────
/**
 * Generate a daily digest summary from the last 24h of signals.
 * Powered by Groq when available.
 */
router.get('/digest', async (_req, res) => {
  try {
    const signals = await redis.getRecentSignals(50)

    // Filter to last 24h
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    const recent = signals.filter((s) => s.timestamp >= cutoff)

    if (recent.length === 0) {
      res.json({
        digest: 'No signals detected in the last 24 hours. The network is quiet.',
        signalCount: 0,
        aiPowered: false,
      })
      return
    }

    if (groq.isEnabled) {
      const digest = await groq.generateDailyDigest(recent)
      if (digest) {
        res.json({ digest, signalCount: recent.length, aiPowered: true })
        return
      }
    }

    // Fallback: text summary without AI
    const counts = countByType(recent)
    const digest = buildFallbackDigest(counts, recent.length)
    res.json({ digest, signalCount: recent.length, aiPowered: false })

  } catch (err) {
    console.error('[AI /digest] Error:', err)
    res.status(500).json({ error: 'Digest generation failed' })
  }
})

// ─── GET /api/ai/analyze/:address ────────────────────────────────────────────
/**
 * Deep analysis of a specific wallet or token address.
 * Returns rug score (for tokens) or wallet info + AI commentary.
 */
router.get('/analyze/:address', async (req, res) => {
  const { address } = req.params
  if (!address || !isValidBase58(address)) {
    res.status(400).json({ error: 'Invalid Solana address' })
    return
  }

  try {
    // Try rug score (token-path)
    const [rugAnalysis, accountInfo] = await Promise.all([
      helius.computeRugScore(address),
      helius.getAccountInfo(address),
    ])

    let aiCommentary: string | null = null
    if (groq.isEnabled) {
      const signalMock = {
        id: 'analyze',
        type: ('RUG_RISK' as const),
        severity: (rugAnalysis.score >= 75 ? 'HIGH' : rugAnalysis.score >= 40 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
        title: `Token Analysis: ${address.slice(0, 8)}...`,
        description: `Rug score ${rugAnalysis.score}/100. Factors: ${Object.entries(rugAnalysis.factors).map(([k, v]) => `${k}=${v}`).join(', ')}`,
        token: address,
        timestamp: Date.now(),
      }
      aiCommentary = await groq.generateSignalCommentary(signalMock)
    }

    res.json({
      address,
      rugScore: rugAnalysis.score,
      rugFactors: rugAnalysis.factors,
      walletBalance: accountInfo?.balance ?? null,
      tokenBalances: accountInfo?.tokenBalances ?? [],
      aiCommentary,
      timestamp: Date.now(),
    })

  } catch (err) {
    console.error('[AI /analyze] Error:', err)
    res.status(500).json({ error: 'Analysis failed' })
  }
})

// ─── Intent Executor ──────────────────────────────────────────────────────────

async function executeIntent(
  intent: string,
  address: string | null,
  groqAnswer: string,
): Promise<Omit<AIResponse, 'aiPowered'>> {
  switch (intent) {

    case 'RUG_CHECK': {
      if (!address) {
        return { type: 'INFO', message: groqAnswer || 'Provide a token mint address to run a rug check.' }
      }
      const analysis = await helius.computeRugScore(address)
      return {
        type: 'ACTION',
        actionType: 'RUG_ANALYSIS',
        message: groqAnswer || `Rug score for ${address.slice(0, 8)}...: ${analysis.score}/100`,
        data: { address, rugScore: analysis.score, factors: analysis.factors },
      }
    }

    case 'WALLET_INFO': {
      if (!address) {
        return { type: 'INFO', message: groqAnswer || 'Provide a wallet address to check its balance.' }
      }
      const info = await helius.getAccountInfo(address)
      if (!info) return { type: 'ERROR', message: 'Wallet not found or RPC unavailable.' }
      return {
        type: 'ACTION',
        actionType: 'WALLET_INFO',
        message: groqAnswer || `Wallet ${address.slice(0, 8)}... holds ${info.balance.toFixed(2)} SOL.`,
        data: info,
      }
    }

    case 'PRICE_CHECK': {
      const price = await helius.getSolPrice()
      return {
        type: 'INFO',
        message: groqAnswer || `SOL is currently trading at $${price.toFixed(2)}.`,
        data: { solPrice: price },
      }
    }

    case 'NETWORK_STATUS': {
      const tps = await helius.getTPS()
      return {
        type: 'INFO',
        message: groqAnswer || `Solana network is processing ${tps} TPS.`,
        data: { tps },
      }
    }

    case 'SIGNAL_SUMMARY': {
      const signals = await redis.getRecentSignals(10)
      return {
        type: 'INFO',
        message: groqAnswer || `${signals.length} signals detected recently.`,
        data: { signals: signals.slice(0, 5) },
      }
    }

    default:
      return { type: 'INFO', message: groqAnswer || "I'm ChainPulse AI. Ask me about on-chain activity, rug risks, whale movements, or wallet balances." }
  }
}

// ─── Keyword Fallback (no AI key) ─────────────────────────────────────────────

async function keywordFallback(query: string): Promise<Omit<AIResponse, 'aiPowered'>> {
  const q = query.toLowerCase()
  const address = extractAddress(query)

  if ((q.includes('rug') || q.includes('safe') || q.includes('check')) && address) {
    const analysis = await helius.computeRugScore(address)
    return {
      type: 'ACTION',
      actionType: 'RUG_ANALYSIS',
      message: `Rug score for ${address.slice(0, 8)}...: ${analysis.score}/100. ${analysis.score >= 75 ? '⚠️ High risk.' : analysis.score >= 40 ? '🟡 Medium risk.' : '✅ Low risk.'}`,
      data: analysis,
    }
  }

  if ((q.includes('balance') || q.includes('wallet') || q.includes('how much')) && address) {
    const info = await helius.getAccountInfo(address)
    if (!info) return { type: 'ERROR', message: 'Wallet not found.' }
    return {
      type: 'ACTION',
      actionType: 'WALLET_INFO',
      message: `Wallet ${address.slice(0, 8)}... has ${info.balance.toFixed(2)} SOL.`,
      data: info,
    }
  }

  if (q.includes('price') || q.includes('sol price')) {
    const price = await helius.getSolPrice()
    return { type: 'INFO', message: `SOL is currently $${price.toFixed(2)}.`, data: { solPrice: price } }
  }

  if (q.includes('tps') || q.includes('network') || q.includes('status')) {
    const tps = await helius.getTPS()
    return { type: 'INFO', message: `Solana network: ${tps} TPS.`, data: { tps } }
  }

  return {
    type: 'INFO',
    message: "I'm ChainPulse AI (keyword mode). Try: 'rug check [MINT]', 'balance of [ADDRESS]', 'SOL price', or 'network status'. Set GROQ_API_KEY for full AI mode.",
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractAddress(str: string): string | null {
  const match = str.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/)
  return match ? match[0] : null
}

function isValidBase58(str: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(str)
}

function countByType(signals: { type: string }[]): Record<string, number> {
  return signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.type] = (acc[s.type] ?? 0) + 1
    return acc
  }, {})
}

function buildFallbackDigest(counts: Record<string, number>, total: number): string {
  const lines: string[] = [`📊 ${total} signals detected in the last 24 hours.`]
  if (counts['WHALE_MOVE']) lines.push(`🐋 ${counts['WHALE_MOVE']} whale movement(s) detected.`)
  if (counts['RUG_RISK']) lines.push(`⚠️ ${counts['RUG_RISK']} rug risk alert(s) fired.`)
  if (counts['LIQUIDITY_SHIFT']) lines.push(`💧 ${counts['LIQUIDITY_SHIFT']} liquidity shift(s) recorded.`)
  if (counts['MARKET_SIGNAL']) lines.push(`📈 ${counts['MARKET_SIGNAL']} market signal(s) triggered.`)
  return lines.join('\n')
}

export default router
