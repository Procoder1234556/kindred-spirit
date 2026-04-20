import Groq from 'groq-sdk';
import { config } from '../config/index';
import { checkLimit } from '../utils/rateLimiter';

export async function generateSignal(prompt: string): Promise<string> {
  const providers = [
    {
      id: 'groq',
      key: config.ai.groqKey,
      execute: async () => {
        if (!checkLimit('groq', 30)) throw new Error('Groq rate limit exceeded');
        const client = new Groq({ apiKey: config.ai.groqKey });
        const res = await client.chat.completions.create({
          model: config.ai.groqModel,
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }]
        });
        return res.choices[0]?.message?.content || '';
      }
    },
    {
      id: 'gemini',
      key: config.ai.geminiKey,
      execute: async () => {
        if (!checkLimit('gemini', 30)) throw new Error('Gemini rate limit exceeded');
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.ai.geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!res.ok) throw new Error(`Gemini Error: ${res.status}`);
        const data = await res.json() as any;
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    },
    {
      id: 'claude',
      key: config.ai.claudeKey,
      execute: async () => {
        if (!checkLimit('claude', 30)) throw new Error('Claude rate limit exceeded');
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': config.ai.claudeKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 512,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        if (!res.ok) throw new Error(`Claude Error: ${res.status}`);
        const data = await res.json() as any;
        return data.content?.[0]?.text || '';
      }
    }
  ];

  // Put primary provider first
  const primaryIdx = providers.findIndex(p => p.id === config.ai.provider);
  if (primaryIdx > 0) {
    const [primary] = providers.splice(primaryIdx, 1);
    providers.unshift(primary);
  }

  for (const provider of providers) {
    if (provider.key) {
      try {
        const result = await provider.execute();
        if (result) return result;
      } catch (err: any) {
        console.warn(`[AI Fallback] ${provider.id} failed:`, err.message);
      }
    }
  }

  return 'Signal unavailable — all AI providers failed.';
}
