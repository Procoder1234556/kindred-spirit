const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

async function setup() {
  console.log('\n🔗 ChainPulse Setup\n');
  console.log('Get your keys from:');
  console.log('  Helius  → https://helius.dev');
  console.log('  Groq    → https://console.groq.com');
  console.log('  Supabase→ https://supabase.com\n');

  const helius = await ask('Helius API Key: ');
  const groq = await ask('Groq API Key: ');
  const telegram = await ask('Telegram Bot Token (Enter to skip): ');
  const supabaseUrl = await ask('Supabase URL: ');
  const supabaseKey = await ask('Supabase Anon Key: ');

  const env = [
    `HELIUS_API_KEY=${helius}`,
    `GROQ_API_KEY=${groq}`,
    `GROQ_MODEL=llama-3.3-70b-versatile`,
    `TELEGRAM_BOT_TOKEN=${telegram}`,
    `SUPABASE_URL=${supabaseUrl}`,
    `SUPABASE_ANON_KEY=${supabaseKey}`,
    `NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=${helius}`,
  ].join('\n');

  fs.writeFileSync('.env', env);
  console.log('\n✅ .env saved. Run: npm run dev\n');
  rl.close();
}

setup();
