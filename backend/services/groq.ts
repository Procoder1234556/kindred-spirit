import { config } from '../config'
import type { Signal } from './signalEngine'
import { generateSignal } from './ai';

// ─── Model ────────────────────────────────────────────────────────────────────
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const MAX_TOKENS = 256

// ─── Rate limiter: 1 AI call per wallet/token per 5 minutes ───────────────────
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_MS = 5 * 60 * 1000

function isRateLimited(key: string): boolean {
  const last = rateLimitMap.get(key)
  if (!last) return false
  return Date.now() - last < RATE_LIMIT_MS
}

function markUsed(key: string): void {
  rateLimitMap.set(key, Date.now())
}

// ─── Groq Client ──────────────────────────────────────────────────────────────

class GroqService {
  private enabled: boolean

  constructor() {
    if (config.GROQ_API_KEY) {
      this.enabled = true
      console.log('✅ Groq AI enabled (model: ' + GROQ_MODEL + ')')
    } else {
      this.enabled = false
      console.warn('⚠️  GROQ_API_KEY not set — AI commentary disabled')
    }
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  // ─── Signal Commentary ──────────────────────────────────────────────────────
  async generateSignalCommentary(signal: Signal): Promise<string | null> {
    if (!this.enabled) return null
    const key = `${signal.wallet ?? ''}|${signal.token ?? ''}|${signal.type}`
    if (isRateLimited(key)) return null
    markUsed(key)

    const systemPrompt = `You are ChainPulse, an AI on-chain intelligence engine for Solana. 
Given an on-chain signal event, produce a short, actionable insight (2-3 sentences max).
Be specific, data-driven, and suggest a follow-up action if relevant.
Do not use markdown. Do not repeat the title.`
    const userPrompt = buildSignalPrompt(signal)

    try {
      return await generateSignal(systemPrompt + '\n' + userPrompt);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[Groq] generateSignalCommentary error:', msg)
      return null
    }
  }

  // ─── Natural Language Command ────────────────────────────────────────────────
  async parseCommand(prompt: string, context?: string): Promise<GroqCommandResponse | null> {
    if (!this.enabled) return null
    const systemPrompt = `You are ChainPulse AI, a Solana on-chain analysis assistant.
You will receive a user question about Solana wallets, tokens, DeFi protocols, or market data.
Respond ONLY with valid JSON in this exact shape:
{
  "intent": "RUG_CHECK" | "WALLET_INFO" | "PRICE_CHECK" | "NETWORK_STATUS" | "SIGNAL_SUMMARY" | "GENERAL",
  "address": "<extracted Solana address or null>",
  "answer": "<plain English answer, 2-4 sentences, no markdown>",
  "confidence": 0.0-1.0
}
If the user requests a rug check or wallet analysis and provides an address, extract it.
${context ? `Current on-chain context:\n${context}` : ''}`

    try {
      const raw = await generateSignal(systemPrompt + '\n' + prompt);
      const jsonStr = raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
      return JSON.parse(jsonStr) as GroqCommandResponse
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[Groq] parseCommand error:', msg)
      return null
    }
  }

  // ─── Daily Digest Summary ────────────────────────────────────────────────────
  async generateDailyDigest(signals: Signal[]): Promise<string | null> {
    if (!this.enabled || signals.length === 0) return null

    const topSignals = signals.slice(0, 10).map(
      (s) => `[${s.severity}] ${s.type}: ${s.title} — ${s.description}`
    ).join('\n')

    const systemPrompt = `You are ChainPulse AI. Summarize the last 24 hours of Solana on-chain activity 
based on the fired signals below. Write 3-5 bullet points. Be concise and actionable.
Start each bullet with an emoji. Do not use markdown headers.`

    try {
      return await generateSignal(systemPrompt + '\n' + `Signals from the last 24h:\n${topSignals}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[Groq] generateDailyDigest error:', msg)
      return null
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSignalPrompt(signal: Signal): string {
  const parts: string[] = [
    `Signal type: ${signal.type}`,
    `Severity: ${signal.severity}`,
    `Title: ${signal.title}`,
    `Description: ${signal.description}`,
  ]
  if (signal.wallet) parts.push(`Wallet: ${signal.wallet}`)
  if (signal.token) parts.push(`Token: ${signal.token}`)
  if (signal.valueUSD) parts.push(`Value: $${(signal.valueUSD / 1e6).toFixed(2)}M`)
  if (signal.protocol) parts.push(`Protocol: ${signal.protocol}`)
  return parts.join('\n')
}

// ─── Response Type ────────────────────────────────────────────────────────────

export interface GroqCommandResponse {
  intent: 'RUG_CHECK' | 'WALLET_INFO' | 'PRICE_CHECK' | 'NETWORK_STATUS' | 'SIGNAL_SUMMARY' | 'GENERAL'
  address: string | null
  answer: string
  confidence: number
}

// Singleton
export const groq = new GroqService()
