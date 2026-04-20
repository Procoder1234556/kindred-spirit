const REQUIRED = ['HELIUS_API_KEY','GROQ_API_KEY','SUPABASE_URL','SUPABASE_ANON_KEY'];
const missing = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.error('\n❌ Missing env vars:', missing.join(', '));
  console.error('Run: npm run setup\n');
  process.exit(1);
}
