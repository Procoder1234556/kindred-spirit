const rateLimitMap = new Map<string, number>();

export function checkLimit(key: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const windowStart = now - 60000;
  
  // Clean up old entries
  for (const [k, v] of rateLimitMap.entries()) {
    if (v < windowStart) rateLimitMap.delete(k);
  }

  // Count requests in current window for this key pattern
  let count = 0;
  for (const [k, v] of rateLimitMap.entries()) {
    if (k.startsWith(key) && v >= windowStart) count++;
  }

  if (count >= maxPerMinute) return false;
  
  rateLimitMap.set(`${key}-${now}-${Math.random()}`, now);
  return true;
}
