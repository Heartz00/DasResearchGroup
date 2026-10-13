import { createHash } from 'node:crypto';
const buckets = new Map<string, { count: number; expires: number }>();
export function allowLogin(username: string, now = Date.now()) {
  const key = createHash('sha256')
    .update(username.trim().toLowerCase())
    .digest('hex');
  for (const [id, bucket] of buckets)
    if (bucket.expires <= now) buckets.delete(id);
  if (buckets.size >= 1000 && !buckets.has(key)) return false;
  const bucket = buckets.get(key) ?? {
    count: 0,
    expires: now + 15 * 60 * 1000,
  };
  bucket.count++;
  buckets.set(key, bucket);
  return bucket.count <= 10;
}
