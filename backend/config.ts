import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'path'

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const ConfigSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Helius
  HELIUS_API_KEY: z.string().min(1, 'HELIUS_API_KEY is required'),
  HELIUS_RPC_URL: z.string().url().optional(),
  HELIUS_WS_URL: z.string().optional(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().optional(),

  // Groq AI
  GROQ_API_KEY: z.string().optional(),

  // Thresholds
  WHALE_THRESHOLD_SOL: z.coerce.number().default(10000),
  RUG_SCORE_THRESHOLD: z.coerce.number().default(75),
  LIQUIDITY_SHIFT_PCT: z.coerce.number().default(20),

  // Mode
  MOCK_MODE: z.coerce.boolean().default(false),

  // ChainPulse Public API Keys
  CHAINPULSE_FREE_API_KEY: z.string().default('chainpulse_live_test_key'),
  CHAINPULSE_PRO_API_KEY: z.string().default('chainpulse_pro_change_me'),
})

import { config as baseConfig } from './config'

function loadConfig() {
  const raw = {
    PORT: baseConfig.app.port,
    NODE_ENV: baseConfig.app.env,
    HELIUS_API_KEY: baseConfig.helius.apiKey || 'demo',
    HELIUS_RPC_URL: baseConfig.helius.rpcUrl,
    HELIUS_WS_URL: baseConfig.helius.wsUrl,
    REDIS_URL: process.env.REDIS_URL, // Not abstracted into global config
    TELEGRAM_BOT_TOKEN: baseConfig.telegram.token,
    GROQ_API_KEY: baseConfig.ai.groqKey,
    WHALE_THRESHOLD_SOL: process.env.WHALE_THRESHOLD_SOL,
    RUG_SCORE_THRESHOLD: process.env.RUG_SCORE_THRESHOLD,
    LIQUIDITY_SHIFT_PCT: process.env.LIQUIDITY_SHIFT_PCT,
    MOCK_MODE: process.env.MOCK_MODE ?? (baseConfig.helius.apiKey === 'your_helius_api_key_here' || !baseConfig.helius.apiKey ? 'true' : 'false'),
  }

  const result = ConfigSchema.safeParse(raw)
  if (!result.success) {
    console.error('❌ Invalid configuration:', result.error.flatten())
    process.exit(1)
  }

  const cfg = result.data
  return {
    ...cfg,
    HELIUS_RPC_URL:
      cfg.HELIUS_RPC_URL ??
      `https://mainnet.helius-rpc.com/?api-key=${cfg.HELIUS_API_KEY}`,
    HELIUS_WS_URL:
      cfg.HELIUS_WS_URL ??
      `wss://atlas-mainnet.helius-rpc.com/?api-key=${cfg.HELIUS_API_KEY}`,
  }
}

export const config = loadConfig()
export type Config = typeof config
