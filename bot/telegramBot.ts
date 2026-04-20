// @ts-nocheck
/* eslint-disable */
/**
 * ChainPulse Telegram Alert Bot
 * Commands: /start /stop /track /untrack /risk /status /signals /summary /alerts /help
 *
 * Signal delivery is driven by the Redis pub/sub channel.
 * Groq-generated AI commentary is shown when present on a signal.
 */
import TelegramBot from 'node-telegram-bot-api'
import { config } from '../backend/config'
import { redis } from '../backend/services/redis'
import { helius } from '../backend/services/helius'
import { groq } from '../backend/services/groq'
import type { Signal } from '../backend/services/signalEngine'

if (!config.TELEGRAM_BOT_TOKEN) {
  console.warn('⚠️  TELEGRAM_BOT_TOKEN not set — Telegram bot disabled')
  process.exit(0)
}

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true })

// ─── Subscriber Registry ──────────────────────────────────────────────────────

interface Subscriber {
  chatId: number
  filter: 'all' | Signal['type']
  /** Minimum severity to receive ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') */
  minSeverity: Signal['severity']
  /** Wallet addresses this subscriber is tracking */
  trackedWallets: Set<string>
}

const subscribers = new Map<number, Subscriber>()

function getOrCreateSub(chatId: number): Subscriber {
  if (!subscribers.has(chatId)) {
    subscribers.set(chatId, {
      chatId,
      filter: 'all',
      minSeverity: 'HIGH',
      trackedWallets: new Set(),
    })
  }
  return subscribers.get(chatId)!
}

// ─── Severity ordering ────────────────────────────────────────────────────────

const SEV_ORDER: Record<Signal['severity'], number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3,
}

function meetsMinSeverity(signal: Signal, min: Signal['severity']): boolean {
  return SEV_ORDER[signal.severity] >= SEV_ORDER[min]
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

const SEVERITY_EMOJI: Record<Signal['severity'], string> = {
  LOW: '🔵',
  MEDIUM: '🟡',
  HIGH: '🟠',
  CRITICAL: '🔴',
}

const TYPE_EMOJI: Record<string, string> = {
  WHALE_MOVE: '🐋',
  RUG_RISK: '⚠️',
  LIQUIDITY_SHIFT: '💧',
  MARKET_SIGNAL: '📈',
  MEV_SANDWICH: '🥪',
  SMART_MONEY: '🧠',
}

function formatSignalMessage(signal: Signal): string {
  const sevEmoji = SEVERITY_EMOJI[signal.severity]
  const typeEmoji = TYPE_EMOJI[signal.type]
  const time = new Date(signal.timestamp).toISOString().replace('T', ' ').slice(0, 19)

  let msg = `${typeEmoji} ${sevEmoji} *${signal.title}*\n\n${signal.description}`
  if (signal.wallet) msg += `\n\n👤 Wallet: \`${signal.wallet.slice(0, 8)}...${signal.wallet.slice(-8)}\``
  if (signal.token)  msg += `\n🪙 Token: \`${signal.token.slice(0, 8)}...${signal.token.slice(-8)}\``
  if (signal.valueUSD && signal.valueUSD > 0)
    msg += `\n💵 Value: \`$${(signal.valueUSD / 1e6).toFixed(2)}M\``
  if (signal.aiCommentary)
    msg += `\n\n🤖 *AI Insight:* _${signal.aiCommentary}_`
  if (signal.txSignature)
    msg += `\n\n🔗 [View on Solscan](https://solscan.io/tx/${signal.txSignature})`
  msg += `\n\n🕐 _${time} UTC_`
  return msg
}

// ─── /start ───────────────────────────────────────────────────────────────────

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  getOrCreateSub(chatId)

  bot.sendMessage(
    chatId,
    `🤖 *ChainPulse Intelligence Bot*\n\nYour on-chain AI alert engine is now active.\nReceiving: \`HIGH\` and \`CRITICAL\` alerts by default.\n\n*Commands:*\n/track \\[address\\] — Monitor a wallet\n/untrack \\[address\\] — Stop tracking\n/risk \\[token\\_mint\\] — Rug risk score\n/signals — Show latest 5 signals\n/summary — AI-generated daily digest\n/status — Network stats\n/alerts — Configure alert severity\n/help — Show this menu\n/stop — Unsubscribe`,
    { parse_mode: 'MarkdownV2' }
  )
  console.log(`✅ Telegram subscriber: ${chatId}`)
})

// ─── /stop ────────────────────────────────────────────────────────────────────

bot.onText(/\/stop/, (msg) => {
  subscribers.delete(msg.chat.id)
  bot.sendMessage(msg.chat.id, '👋 Unsubscribed from ChainPulse alerts.')
})

// ─── /help ────────────────────────────────────────────────────────────────────

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `*ChainPulse Bot — Command Reference*\n\n` +
    `/track [address] — Track a Solana wallet\n` +
    `/untrack [address] — Stop tracking a wallet\n` +
    `/risk [mint] — Get rug risk score for a token\n` +
    `/signals — Latest 5 on-chain signals\n` +
    `/summary — AI daily digest (last 24h)\n` +
    `/status — Network TPS and SOL price\n` +
    `/alerts [severity] — Set minimum alert level\n` +
    `/stop — Unsubscribe from all alerts`,
    { parse_mode: 'Markdown' }
  )
})

// ─── /track [address] ─────────────────────────────────────────────────────────

bot.onText(/\/track(?:\s+([1-9A-HJ-NP-Za-km-z]{32,44}))?/, async (msg, match) => {
  const chatId = msg.chat.id
  const address = match?.[1]

  if (!address) {
    bot.sendMessage(chatId, '❌ Usage: `/track <solana-address>`', { parse_mode: 'Markdown' })
    return
  }

  const sub = getOrCreateSub(chatId)

  if (sub.trackedWallets.size >= 10) {
    bot.sendMessage(chatId, '⚠️ Max 10 wallets tracked per user. Use /untrack to remove one.')
    return
  }

  sub.trackedWallets.add(address)

  // Fetch wallet info to confirm it exists
  bot.sendMessage(chatId, `⏳ Looking up \`${address.slice(0, 8)}...\``, { parse_mode: 'Markdown' })

  try {
    const info = await helius.getAccountInfo(address)
    if (!info) {
      bot.sendMessage(chatId, `❌ Could not resolve wallet \`${address.slice(0, 8)}...\`. Check the address.`, { parse_mode: 'Markdown' })
      sub.trackedWallets.delete(address)
      return
    }

    bot.sendMessage(
      chatId,
      `✅ *Tracking wallet* \`${address.slice(0, 8)}...${address.slice(-8)}\`\n\n` +
      `💰 Balance: \`${info.balance.toFixed(2)} SOL\`\n` +
      `🪙 Token accounts: \`${info.tokenBalances.length}\`\n\n` +
      `_You'll receive ${sub.minSeverity}+ alerts involving this wallet._`,
      { parse_mode: 'Markdown' }
    )
  } catch {
    bot.sendMessage(chatId, `✅ Tracking \`${address.slice(0, 8)}...\` — balance lookup failed but monitoring is active.`, { parse_mode: 'Markdown' })
  }
})

// ─── /untrack [address] ───────────────────────────────────────────────────────

bot.onText(/\/untrack(?:\s+([1-9A-HJ-NP-Za-km-z]{32,44}))?/, (msg, match) => {
  const chatId = msg.chat.id
  const address = match?.[1]

  if (!address) {
    bot.sendMessage(chatId, '❌ Usage: `/untrack <solana-address>`', { parse_mode: 'Markdown' })
    return
  }

  const sub = getOrCreateSub(chatId)
  if (sub.trackedWallets.delete(address)) {
    bot.sendMessage(chatId, `✅ Stopped tracking \`${address.slice(0, 8)}...\``, { parse_mode: 'Markdown' })
  } else {
    bot.sendMessage(chatId, `ℹ️ Wallet \`${address.slice(0, 8)}...\` was not in your tracking list.`, { parse_mode: 'Markdown' })
  }
})

// ─── /risk [mint] ─────────────────────────────────────────────────────────────

bot.onText(/\/risk(?:\s+([1-9A-HJ-NP-Za-km-z]{32,44}))?/, async (msg, match) => {
  const chatId = msg.chat.id
  const mint = match?.[1]

  if (!mint) {
    bot.sendMessage(chatId, '❌ Usage: `/risk <token-mint-address>`', { parse_mode: 'Markdown' })
    return
  }

  bot.sendMessage(chatId, `⏳ Analyzing token \`${mint.slice(0, 8)}...\``, { parse_mode: 'Markdown' })

  try {
    const { score, factors } = await helius.computeRugScore(mint)
    const riskLabel = score >= 75 ? '🔴 HIGH RISK' : score >= 40 ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'
    const factorLines = Object.entries(factors)
      .filter(([k]) => k !== 'total')
      .map(([k, v]) => `  • ${k}: +${v}`)
      .join('\n') || '  • None detected'

    let reply =
      `⚠️ *Token Rug Risk Analysis*\n\n` +
      `Token: \`${mint.slice(0, 8)}...${mint.slice(-8)}\`\n` +
      `Score: \`${score}/100\` — ${riskLabel}\n\n` +
      `*Risk Factors:*\n${factorLines}`

    // Groq AI commentary if available
    if (groq.isEnabled) {
      const mockSignal: Signal = {
        id: 'bot-risk',
        type: 'RUG_RISK',
        severity: score >= 75 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW',
        title: `Rug Risk: ${score}/100`,
        description: `Token ${mint.slice(0, 8)} has a rug risk score of ${score}/100.`,
        token: mint,
        timestamp: Date.now(),
      }
      const commentary = await groq.generateSignalCommentary(mockSignal)
      if (commentary) {
        reply += `\n\n🤖 *AI Insight:* _${commentary}_`
      }
    }

    bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' })
  } catch (err) {
    bot.sendMessage(chatId, '❌ Failed to analyze token. Please try again.')
  }
})

// ─── /signals ─────────────────────────────────────────────────────────────────

bot.onText(/\/signals/, async (msg) => {
  const chatId = msg.chat.id

  try {
    const signals = await redis.getRecentSignals(5)
    if (signals.length === 0) {
      bot.sendMessage(chatId, '📭 No recent signals detected.')
      return
    }

    const lines = signals.map((s, i) => {
      const time = new Date(s.timestamp).toISOString().slice(11, 19)
      return `${i + 1}. ${TYPE_EMOJI[s.type]} [${s.severity}] ${s.title} — _${time} UTC_`
    }).join('\n')

    bot.sendMessage(chatId, `📡 *Latest Signals:*\n\n${lines}`, { parse_mode: 'Markdown' })
  } catch {
    bot.sendMessage(chatId, '❌ Failed to fetch signals.')
  }
})

// ─── /summary ─────────────────────────────────────────────────────────────────

bot.onText(/\/summary/, async (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, '⏳ Generating AI digest for the last 24h...')

  try {
    const signals = await redis.getRecentSignals(50)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    const recent = signals.filter((s) => s.timestamp >= cutoff)

    if (recent.length === 0) {
      bot.sendMessage(chatId, '📭 No signals in the last 24 hours. Network is quiet.')
      return
    }

    if (groq.isEnabled) {
      const digest = await groq.generateDailyDigest(recent)
      if (digest) {
        bot.sendMessage(chatId, `📊 *AI Daily Digest*\n\n${digest}`, { parse_mode: 'Markdown' })
        return
      }
    }

    // Fallback text summary
    const counts: Record<string, number> = {}
    for (const s of recent) counts[s.type] = (counts[s.type] ?? 0) + 1
    const lines = [
      `📊 *24h Summary* — ${recent.length} signals total`,
      counts.WHALE_MOVE    ? `🐋 Whale moves: ${counts.WHALE_MOVE}` : '',
      counts.RUG_RISK      ? `⚠️ Rug risks: ${counts.RUG_RISK}` : '',
      counts.LIQUIDITY_SHIFT ? `💧 Liquidity shifts: ${counts.LIQUIDITY_SHIFT}` : '',
      counts.MARKET_SIGNAL ? `📈 Market signals: ${counts.MARKET_SIGNAL}` : '',
    ].filter(Boolean).join('\n')

    bot.sendMessage(chatId, lines, { parse_mode: 'Markdown' })
  } catch {
    bot.sendMessage(chatId, '❌ Failed to generate summary.')
  }
})

// ─── /status ──────────────────────────────────────────────────────────────────

bot.onText(/\/status/, async (msg) => {
  try {
    const metrics = await redis.getMetrics()
    const tps = (metrics?.tps as number) ?? 'N/A'
    const price = typeof metrics?.solPrice === 'number' ? `$${(metrics.solPrice as number).toFixed(2)}` : 'N/A'
    const tvl = typeof metrics?.tvlMonitored === 'number'
      ? `$${((metrics.tvlMonitored as number) / 1e9).toFixed(1)}B`
      : 'N/A'

    bot.sendMessage(
      msg.chat.id,
      `📊 *Solana Network Status*\n\n⚡ TPS: \`${tps}\`\n💰 SOL Price: \`${price}\`\n🏦 TVL Monitored: \`${tvl}\``,
      { parse_mode: 'Markdown' }
    )
  } catch {
    bot.sendMessage(msg.chat.id, '❌ Failed to fetch metrics.')
  }
})

// ─── /alerts [severity] ───────────────────────────────────────────────────────

bot.onText(/\/alerts(?:\s+(\w+))?/, (msg, match) => {
  const chatId = msg.chat.id
  const arg = match?.[1]?.toUpperCase() as Signal['severity'] | undefined
  const validSeverities: Signal['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  if (!arg || !validSeverities.includes(arg)) {
    const sub = getOrCreateSub(chatId)
    bot.sendMessage(
      chatId,
      `🔔 *Alert Level* — Current: \`${sub.minSeverity}\`\n\nSet minimum severity:\n/alerts LOW — All alerts\n/alerts MEDIUM — Medium & above\n/alerts HIGH — High & critical only _(default)_\n/alerts CRITICAL — Critical only`,
      { parse_mode: 'Markdown' }
    )
    return
  }

  const sub = getOrCreateSub(chatId)
  sub.minSeverity = arg
  bot.sendMessage(chatId, `✅ Alert level set to: \`${arg}\``, { parse_mode: 'Markdown' })
})

// ─── Signal Delivery from Redis ───────────────────────────────────────────────

redis.subscribeToSignals((signal) => {
  for (const sub of subscribers.values()) {
    // Filter by type if subscriber set a specific type filter
    if (sub.filter !== 'all' && sub.filter !== signal.type) continue

    // Filter by minimum severity
    if (!meetsMinSeverity(signal, sub.minSeverity)) continue

    // If subscriber tracks specific wallets, only alert if involved
    if (sub.trackedWallets.size > 0) {
      const walletInvolved =
        (signal.wallet && sub.trackedWallets.has(signal.wallet)) ||
        (signal.token  && sub.trackedWallets.has(signal.token))

      // Also send any CRITICAL signal regardless of wallet tracking
      if (!walletInvolved && signal.severity !== 'CRITICAL') continue
    }

    bot.sendMessage(
      sub.chatId,
      formatSignalMessage(signal),
      { parse_mode: 'Markdown', disable_web_page_preview: false }
    ).catch(() => {
      // Remove subscribers that have blocked/deleted the bot
      subscribers.delete(sub.chatId)
    })
  }
})

console.log('🤖 ChainPulse Telegram Bot started')
export { bot }
