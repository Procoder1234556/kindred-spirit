const fs = require('fs');
const { execSync } = require('child_process');

if (!fs.existsSync('.env')) {
  console.log('\n⚠️  First time setup required...\n');
  execSync('node scripts/setup.js', { stdio: 'inherit' });
}

execSync('npm run dev', { stdio: 'inherit' });
