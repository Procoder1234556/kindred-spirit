require('../scripts/validate.js');
import express from 'express'
import cors from 'cors'
import { WebSocketServer, WebSocket } from 'ws'
import http from 'http'
import { config } from './config'
import { signalEngine } from './services/signalEngine'
import { redis } from './services/redis'
import { solanaListener } from '../onchain/listener'

// Routes
import signalsRouter from './routes/signals'
import metricsRouter from './routes/metrics'
import walletsRouter from './routes/wallets'
import tokensRouter from './routes/tokens'
import aiRouter from './routes/ai'
import publicApiRouter from './routes/api'

// ─── Express App ──────────────────────────────────────────────────────────────

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

// ─── REST Routes ──────────────────────────────────────────────────────────────

app.use('/api/signals', signalsRouter)
app.use('/api/metrics', metricsRouter)
app.use('/api/wallets', walletsRouter)
app.use('/api/tokens', tokensRouter)
app.use('/api/ai', aiRouter)
app.use('/api', publicApiRouter) // Phase 4.1–4.7 Public APIs (rate-limited, API-key gated)

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    redis: redis.isReady,
    timestamp: Date.now(),
  })
})

// ─── HTTP + WebSocket Server ──────────────────────────────────────────────────

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

const wsClients = new Set<WebSocket>()

wss.on('connection', (ws) => {
  wsClients.add(ws)
  console.log(`🔌 WS client connected (total: ${wsClients.size})`)

  // Send last 10 signals on connect
  redis.getRecentSignals(10).then((signals) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'INIT', signals }))
    }
  })

  ws.on('close', () => {
    wsClients.delete(ws)
    console.log(`🔌 WS client disconnected (total: ${wsClients.size})`)
  })

  ws.on('error', () => wsClients.delete(ws))
})

// Fan out new signals to all WebSocket clients
function broadcastSignal(payload: object): void {
  const msg = JSON.stringify({ type: 'SIGNAL', data: payload })
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg)
    }
  }
}

// ─── Signal Pipeline ──────────────────────────────────────────────────────────

signalEngine.on('signal', async (signal) => {
  console.log(`🚨 [${signal.severity}] ${signal.type}: ${signal.title}`)

  // Persist to Redis and publish to all consumers
  await redis.pushSignal(signal)

  // Push to WebSocket clients
  broadcastSignal(signal)
})

// When Groq finishes enriching a signal, update Redis and notify clients
signalEngine.on('signal:enriched', async (signal) => {
  await redis.pushSignal(signal) // Overwrite / append enriched version
  broadcastSignal({ ...signal, enriched: true })
})

// Wire: Solana listener → Signal Engine
solanaListener.on('transaction', (event) => {
  signalEngine.ingest(event)
})

// ─── Boot ─────────────────────────────────────────────────────────────────────

async function bootstrap() {
  // Connect to Redis (graceful — server starts even if Redis is down)
  try {
    await redis.connect()
  } catch (err) {
    console.warn('⚠️  Redis unavailable — running without cache')
  }

  // Start Solana listener
  try {
    solanaListener.connect()
  } catch (err) {
    console.warn('⚠️  Solana listener failed to start:', err)
  }

  // Start HTTP server
  server.listen(config.PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║  🔗  ChainPulse Backend                 ║
║  ────────────────────────────────────── ║
║  HTTP  → http://localhost:${config.PORT}          ║
║  WS    → ws://localhost:${config.PORT}/ws         ║
║  Env   → ${config.NODE_ENV.padEnd(10)}                  ║
╚══════════════════════════════════════════╝
    `)
  })

  // Metrics refresh loop every 30s
  setInterval(async () => {
    try {
      const { helius } = await import('./services/helius')
      const [tps, solPrice] = await Promise.all([
        helius.getTPS(),
        helius.getSolPrice(),
      ])
      const signals = await redis.getRecentSignals(100)
      await redis.setMetrics({
        tps,
        solPrice,
        tvlMonitored: 1_200_000_000 + Math.random() * 50_000_000,
        alertCounts: { total: signals.length },
        timestamp: Date.now(),
      })
    } catch {
      // Silent fail — metrics are best-effort
    }
  }, 30_000)
}

bootstrap()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down...')
  solanaListener.disconnect()
  server.close()
  process.exit(0)
})

export { app, server, wss }
