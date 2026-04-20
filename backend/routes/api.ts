import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { helius } from '../services/helius'
import { walletRiskEngine } from '../services/riskEngine'
import { redis } from '../services/redis'
import { groq } from '../services/groq'

const router = Router()

// ─── Phase 4.3 — Rate Limiting ────────────────────────────────────────────────
// 60 requests per 15 minutes for all public API consumers
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
})

router.use(publicApiLimiter)

// ─── Phase 4.2 — API Key Authentication ──────────────────────────────────────
// Free tier: chainpulse_free_key (rate limited to 60 req/15m above)
// Pro tier:  chainpulse_pro_*** (bypasses additional restrictions)
const FREE_KEY = 'chainpulse_live_test_key'
const PRO_PREFIX = 'chainpulse_pro_'

type Tier = 'free' | 'pro'

function resolveTier(key: string): Tier {
  return key.startsWith(PRO_PREFIX) ? 'pro' : 'free'
}

router.use((req, res, next) => {
  const apiKey =
    (req.headers['authorization']?.replace('Bearer ', '') as string) ||
    (req.query.api_key as string) ||
    ''

  if (!apiKey || (apiKey !== FREE_KEY && !apiKey.startsWith(PRO_PREFIX))) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' })
    return
  }

  // Attach tier to request for downstream use
  ;(req as any).tier = resolveTier(apiKey)
  next()
})

// ─── Phase 4.6 — Free vs Pro Tier Guard ──────────────────────────────────────
function requirePro(req: any, res: any, next: any) {
  if ((req as any).tier !== 'pro') {
    res.status(403).json({
      error: 'Pro tier required. Upgrade at https://chainpulse.ai/upgrade',
      tier: 'free',
    })
    return
  }
  next()
}

// ─── GET /public/api/wallet/:pubkey/risk ──────────────────────────────────────

router.get('/wallet/:pubkey/risk', async (req, res) => {
  const { pubkey } = req.params
  try {
    const risk = await walletRiskEngine.score(pubkey)
    const recentSignals = await redis.getRecentSignals(50)
    const walletSignals = recentSignals.filter(s => s.wallet === pubkey)

    res.json({
      address: pubkey,
      riskScore: risk?.score ?? 0,
      riskLabel: risk?.label ?? 'UNKNOWN',
      factors: risk?.factors ?? {},
      recentSignals: walletSignals,
      tier: (req as any).tier,
    })
  } catch {
    res.status(500).json({ error: 'Internal server error while fetching wallet risk' })
  }
})

// ─── GET /public/api/token/:mint/analysis ────────────────────────────────────

router.get('/token/:mint/analysis', async (req, res) => {
  const { mint } = req.params
  try {
    const [tokenRisk, metadata, holderData] = await Promise.all([
      helius.getTokenRiskScore(mint),
      helius.getTokenMetadata(mint),
      helius.getTokenHolders(mint),
    ])

    res.json({
      mint,
      name: metadata?.name || 'Unknown',
      symbol: metadata?.symbol || 'UNKNOWN',
      supply: metadata?.supply,
      rugRiskScore: tokenRisk.score,
      riskFactors: tokenRisk.factors,
      holders: {
        totalFetched: holderData?.totalHolders ?? null,
        top10ConcentrationPct: holderData?.top10ConcentrationPct ?? null,
        top10: holderData?.top10 ?? [],
      },
      liquidityStatus: 'Assumed Active', // placeholder until LP API integrated
      tier: (req as any).tier,
    })
  } catch {
    res.status(500).json({ error: 'Internal server error while fetching token analysis' })
  }
})

// ─── GET /public/api/whale-activity ──────────────────────────────────────────

router.get('/whale-activity', async (req, res) => {
  try {
    const recentSignals = await redis.getRecentSignals(1000)
    const tokenMint = req.query.token as string | undefined

    const whaleFlows = recentSignals
      .filter(s => s.type === 'WHALE_MOVE' && (!tokenMint || s.token === tokenMint))
      .map(s => ({
        timestamp: s.timestamp,
        wallet: s.wallet,
        valueUSD: s.valueUSD,
        description: s.description,
      }))

    res.json({
      token: tokenMint ?? 'all',
      window: req.query.window || '24h',
      whaleFlows,
      tier: (req as any).tier,
    })
  } catch {
    res.status(500).json({ error: 'Internal server error while fetching whale activity' })
  }
})

// ─── POST /public/api/chat — Phase 4.4 "Ask ChainPulse" ─────────────────────
// Takes a natural language query, injects wallet/token context, returns AI response

router.post('/chat', async (req, res) => {
  const { query, walletAddress, tokenMint } = req.body

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    res.status(400).json({ error: 'Missing query parameter' })
    return
  }

  try {
    // Build on-chain context if addresses were supplied
    let contextParts: string[] = []
    if (walletAddress) {
      const info = await helius.getAccountInfo(walletAddress)
      if (info) {
        contextParts.push(
          `Wallet ${walletAddress}: ${info.balance.toFixed(2)} SOL, ${info.tokenBalances.length} token accounts`
        )
      }
    }
    if (tokenMint) {
      const risk = await helius.computeRugScore(tokenMint)
      contextParts.push(`Token ${tokenMint}: rug score ${risk.score}/100`)
    }
    const metrics = await redis.getMetrics()
    if (metrics) {
      contextParts.push(`Network TPS: ${metrics.tps}, SOL: $${metrics.solPrice}`)
    }

    const context = contextParts.length > 0 ? contextParts.join('\n') : undefined

    const parsed = groq.isEnabled ? await groq.parseCommand(query, context) : null

    if (parsed) {
      res.json({
        answer: parsed.answer,
        intent: parsed.intent,
        address: parsed.address,
        confidence: parsed.confidence,
        aiPowered: true,
        tier: (req as any).tier,
      })
    } else {
      // Fallback: echo query with context note
      res.json({
        answer: `ChainPulse received: "${query}". Set GROQ_API_KEY for full AI responses.`,
        aiPowered: false,
        tier: (req as any).tier,
      })
    }
  } catch {
    res.status(500).json({ error: 'Chat processing failed' })
  }
})

// ─── GET /public/api/widget/badge/:pubkey — Phase 4.5 Embeddable Risk Badge ──

router.get('/widget/badge/:pubkey', async (req, res) => {
  const { pubkey } = req.params
  try {
    const risk = await walletRiskEngine.score(pubkey)
    const score = risk?.score ?? 0
    const label = risk?.label ?? 'UNKNOWN'
    const color = score >= 75 ? '#ff4c4c' : score >= 50 ? '#ff9900' : score >= 25 ? '#f5c518' : '#6ee591'
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; font-family: -apple-system, sans-serif; }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: #131313;
             border-radius: 8px; padding: 8px 14px; border-left: 4px solid ${color}; }
    .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #aaa; }
    .score { font-size: 22px; font-weight: 900; color: ${color}; }
    .risk  { font-size: 11px; color: ${color}; font-weight: 700; }
    .addr  { font-size: 9px; color: #555; font-family: monospace; }
  </style>
</head>
<body>
  <div class="badge">
    <div>
      <div class="label">Risk Score</div>
      <div class="score">${score}<span style="font-size:13px;color:#555">/100</span></div>
      <div class="risk">${label}</div>
      <div class="addr">${pubkey.slice(0, 8)}...${pubkey.slice(-6)}</div>
    </div>
  </div>
  <script>
    // Notify parent of badge height for iframe resizing
    window.parent.postMessage({ type: 'chainpulse-badge', height: document.body.scrollHeight }, '*')
  </script>
</body>
</html>`
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('X-Frame-Options', 'ALLOWALL')
    res.send(html)
  } catch {
    res.status(500).send('<p>Badge unavailable</p>')
  }
})

// ─── Phase 4.7 — Solana Pay / On-chain Pro Upgrade Stub ──────────────────────

router.post('/upgrade/solana-pay', async (req, res) => {
  const { walletAddress } = req.body
  if (!walletAddress) {
    res.status(400).json({ error: 'walletAddress is required' })
    return
  }

  // Stub: In production, generate a Solana Pay transaction request URL
  // pointing to an on-chain payment for the ChainPulse Pro subscription account.
  const CHAINPULSE_TREASURY = 'BHoTFBm6Gy4iMvvqfRaezAuFGPpnJ2JdqASwjCB1fFJB'
  const PRO_PRICE_SOL = 0.1

  res.json({
    status: 'payment_pending',
    method: 'SolanaPay',
    label: 'ChainPulse Pro Subscription',
    recipient: CHAINPULSE_TREASURY,
    amount: PRO_PRICE_SOL,
    splToken: null, // SOL payment
    reference: walletAddress,
    memo: 'ChainPulse Pro — 30-day access',
    // Solana Pay URL schema: https://docs.solanapay.com/spec
    paymentUrl: `solana:${CHAINPULSE_TREASURY}?amount=${PRO_PRICE_SOL}&label=ChainPulse+Pro&memo=ChainPulse+Pro+%E2%80%94+30+Day+Access&reference=${walletAddress}`,
    note: 'STUB: not yet live. Will be wired to on-chain program in production.',
  })
})

// ─── POST /public/api/alerts/webhook ─────────────────────────────────────────
const registeredWebhooks = new Set<string>()

router.post('/alerts/webhook', (req, res) => {
  const { url, events } = req.body
  if (!url) {
    res.status(400).json({ error: 'Missing webhook URL' })
    return
  }
  registeredWebhooks.add(url)
  res.json({ status: 'success', message: 'Webhook registered', url, events: events || ['all'] })
})

export default router
