const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

async function rotateKeys() {
  if (!fs.existsSync('.env')) {
    console.error('❌ No .env file found to rotate.');
    process.exit(1);
  }

  console.log('\n🔄 ChainPulse Key Rotation\n');
  fs.copyFileSync('.env', '.env.backup');
  console.log('✅ Backed up current config to .env.backup\n');

  const lines = fs.readFileSync('.env', 'utf-8').split('\n');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(res => rl.question(q, res));

  const newLines = [];
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      newLines.push(line);
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx);
      const val = trimmed.slice(eqIdx + 1);
      const preview = val ? val.slice(0, 8) + '...' : '(empty)';
      
      const newPrompt = await ask(`${key} [current: ${preview}]: `);
      if (newPrompt.trim() !== '') {
        newLines.push(`${key}=${newPrompt.trim()}`);
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }

  fs.writeFileSync('.env', newLines.join('\n'));
  console.log('\n✅ Key rotation complete. Old keys saved in .env.backup.\n');
  rl.close();
}

rotateKeys();
