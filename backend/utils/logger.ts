const SENSITIVE = ['KEY', 'TOKEN', 'SECRET', 'PASSWORD', 'URL'];

export function safeLog(obj: Record<string, any>) {
  const sanitized = Object.fromEntries(
    Object.entries(obj).map(([k, v]) =>
      SENSITIVE.some(s => k.toUpperCase().includes(s))
        ? [k, '***redacted***']
        : [k, v]
    )
  );
  console.log(JSON.stringify(sanitized, null, 2));
}
