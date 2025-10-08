export const exponentialBackoff = (attempt: number, baseMs = 500, maxMs = 6000): number => {
  const exp = Math.min(maxMs, baseMs * Math.pow(2, attempt - 1));
  const jitter = Math.random() * baseMs;
  return Math.min(maxMs, exp + jitter);
};
