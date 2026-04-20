/**
 * walletLabels.ts — Phase 1.9
 *
 * A curated JSON map of known Solana wallet pubkeys to human-readable labels.
 * Includes: exchange hot wallets, MEV bots, known protocols, and fund addresses.
 * Used to enrich signals and wallet risk reports with contextual labels.
 */

export const WALLET_LABELS: Record<string, string> = {
  // ── Centralized Exchange Hot Wallets ────────────────────────────────────────
  '5tzFkiKscXHK5ZXCGbXZxdw7gA3oeFbn2sNxfCvMer4M': 'Binance Hot Wallet',
  '29c9oHhgMaG6cPEpBmWBHMhApvVAX6gAHnacQ6PEkQBm': 'Coinbase Prime',
  'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE': 'FTX Exchange (archived)',
  'Cz6APjLCZBL74XBcXhq3Y3GqA7UFLP9RN3MFCMT1mKqx': 'Kraken Hot Wallet',
  'H3oaKD53FApSiLeYSBpwfxvdRZpzuDXb84HXGHkh3HEF': 'OKX Hot Wallet',
  'BGsRn7WB68GjVi7QcLSmJQneBU2gMBg7PPJWfPaTLGJP': 'Bybit Hot Wallet',

  // ── Jupiter Aggregator ───────────────────────────────────────────────────────
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter V6 Router',
  'BHoTFBm6Gy4iMvvqfRaezAuFGPpnJ2JdqASwjCB1fFJB': 'Jupiter DAO Treasury',

  // ── Raydium ──────────────────────────────────────────────────────────────────
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium V4 AMM',
  'AP51WLiiqTdbZfgyRMs35PsZpdmLuyfLgXwY2QT5uGsS': 'Raydium Fee Account',
  '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1': 'Raydium Authority',

  // ── Orca ─────────────────────────────────────────────────────────────────────
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': 'Orca Whirlpools',
  'GVV4oDbGnqexApPUfKSHVKMFvfJsfDFpTqKMwWbzPBaH': 'Orca Fee Wallet',

  // ── Known MEV Bots ───────────────────────────────────────────────────────────
  'Bx8E9KHCFXW9JrHFwp1rT5F7nmYuKhwnjJtmAKbz8hgK': 'MEV Bot #1',
  'MEVbotSVxy3DJKxSHGEBvKFQSmgVzHPVPdGn1vKgzFz': 'MEV Bot #2',
  'sando9G5e2YtBaREaLq2HwvhzPGZmaxX9kV1AHdQAv1': 'Sandwich Bot (Sando)',

  // ── Solend Protocol ──────────────────────────────────────────────────────────
  'So1endDq2YkqhipRvu3Y7TRfz2VwfRvMZQrFNp4D4bM': 'Solend Main Pool',

  // ── Marinade Finance ────────────────────────────────────────────────────────
  'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD': 'Marinade Finance',

  // ── Metaplex ────────────────────────────────────────────────────────────────
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': 'Metaplex Token Metadata',

  // ── System Programs ─────────────────────────────────────────────────────────
  '11111111111111111111111111111111': 'System Program',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'SPL Token Program',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bJ': 'Associated Token Program',

  // ── Known Whale / Alpha Wallets ──────────────────────────────────────────────
  '4Nd1mBQtrCGMBMMVmyRkBFG9R41nZ6pA1n1oW2w4E2Kq': 'Alpha Fund Wallet #1',
  '9WzDXwBbmcg8ZXcj9DqYtT9k9zNtzG6kK71iC21b1L8M': 'Alpha Fund Wallet #2',
  'DdZR6zRFiUt4S5mg7AV1uKB2z1f1smNYNiBh3cTnZWZT': 'MarginFi Treasury',
}

/**
 * Returns a human-readable label for a wallet pubkey, or null if unknown.
 */
export function getWalletLabel(pubkey: string): string | null {
  return WALLET_LABELS[pubkey] ?? null
}
