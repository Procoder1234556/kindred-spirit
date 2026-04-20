import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  helius: {
    apiKey: process.env.HELIUS_API_KEY || '',
    rpcUrl: `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
    wsUrl: `wss://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'groq',
    groqKey: process.env.GROQ_API_KEY || '',
    groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    geminiKey: process.env.GEMINI_API_KEY || '',
    claudeKey: process.env.ANTHROPIC_API_KEY || '',
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    enabled: !!process.env.TELEGRAM_BOT_TOKEN,
  },
  db: {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_ANON_KEY || '',
  },
  app: {
    port: parseInt(process.env.PORT || '3001'),
    env: process.env.NODE_ENV || 'development',
    isProd: process.env.NODE_ENV === 'production',
  }
};
