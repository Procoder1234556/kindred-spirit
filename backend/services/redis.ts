import Redis from 'ioredis'
import { config } from '../config'
import type { Signal } from './signalEngine'

const SIGNALS_KEY = 'chainpulse:signals'
const METRICS_KEY = 'chainpulse:metrics'
const SIGNALS_CHANNEL = 'chainpulse:signals:new'
const MAX_SIGNALS = 100

class RedisService {
  private publisher: Redis | null = null
  private subscriber: Redis | null = null
  private isConnected = false
  private mockStore: string[] = [] // stringified signals
  private mockMetrics: string | null = null
  private mockHandlers: Set<(msg: string) => void> = new Set()

  constructor() {
    if (config.MOCK_MODE) {
      console.warn('🛠️  Running in MOCK_MODE: In-memory signal store active.')
      return
    }

    this.publisher = new Redis(config.REDIS_URL, {
      lazyConnect: true,
      retryStrategy: (times) =>
        times > 5 ? null : Math.min(times * 200, 2000),
    })

    this.publisher.on('connect', () => {
      this.isConnected = true
      console.log('✅ Redis connected')
    })
    this.publisher.on('error', (err) =>
      console.error('❌ Redis error:', err.message)
    )
  }

  async connect(): Promise<void> {
    await this.publisher.connect()
  }

  // ─── Signal Storage ──────────────────────────────────────────────────────

  async pushSignal(signal: Signal): Promise<void> {
    const serialized = JSON.stringify(signal)

    if (config.MOCK_MODE || !this.isConnected) {
      this.mockStore.unshift(serialized)
      if (this.mockStore.length > MAX_SIGNALS) this.mockStore.pop()
      this.mockHandlers.forEach((h) => h(serialized))
      return
    }

    await this.publisher!.lpush(SIGNALS_KEY, serialized)
    await this.publisher!.ltrim(SIGNALS_KEY, 0, MAX_SIGNALS - 1)
    await this.publisher!.expire(SIGNALS_KEY, 86400) // 24h TTL
    await this.publisher!.publish(SIGNALS_CHANNEL, serialized)
  }

  async getRecentSignals(limit = 100): Promise<Signal[]> {
    if (config.MOCK_MODE || !this.isConnected) {
      return this.mockStore.map((s) => JSON.parse(s) as Signal)
    }
    const items = await this.publisher!.lrange(SIGNALS_KEY, 0, limit - 1)
    return items.map((s) => JSON.parse(s) as Signal)
  }

  // ─── Metrics Cache ───────────────────────────────────────────────────────

  async setMetrics(metrics: Record<string, unknown>): Promise<void> {
    if (config.MOCK_MODE || !this.isConnected) {
      this.mockMetrics = JSON.stringify(metrics)
      return
    }
    await this.publisher!.set(METRICS_KEY, JSON.stringify(metrics), 'EX', 15)
  }

  async getMetrics(): Promise<Record<string, unknown> | null> {
    if (config.MOCK_MODE || !this.isConnected) {
      return this.mockMetrics ? JSON.parse(this.mockMetrics) : null
    }
    const raw = await this.publisher!.get(METRICS_KEY)
    return raw ? JSON.parse(raw) : null
  }

  // ─── Pub/Sub Subscription ────────────────────────────────────────────────

  subscribe(channel: string, handler: (message: string) => void): void {
    if (config.MOCK_MODE) {
      this.mockHandlers.add(handler)
      return
    }

    if (!this.subscriber) {
      this.subscriber = this.publisher!.duplicate()
    }
    this.subscriber.subscribe(channel, (err) => {
      if (err) console.error('Redis subscribe error:', err)
    })
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) handler(msg)
    })
  }

  subscribeToSignals(handler: (signal: Signal) => void): void {
    this.subscribe(SIGNALS_CHANNEL, (msg) => {
      try {
        handler(JSON.parse(msg) as Signal)
      } catch {
        // ignore
      }
    })
  }

  get isReady(): boolean {
    return this.isConnected
  }
}

export const redis = new RedisService()
export { SIGNALS_CHANNEL }
