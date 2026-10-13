import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export type Session = {
  username: string;
  password: string;
  userId: number;
  expires: number;
  site: string;
};
export const lifetime = 60 * 60 * 4;
export function sessionKey(secret: string) {
  const key = Buffer.from(secret, 'base64');
  if (key.length !== 32 || key.toString('base64') !== secret)
    throw new Error('Invalid session configuration');
  return key;
}
export function seal(session: Session, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', sessionKey(secret), iv);
  cipher.setAAD(Buffer.from('das-admin-v1'));
  const value = Buffer.concat([
    cipher.update(JSON.stringify(session)),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), value]).toString('base64url');
}
export function unseal(
  token: string,
  secret: string,
  site: string,
  now = Date.now(),
): Session | null {
  try {
    if (token.length > 3500) return null;
    const data = Buffer.from(token, 'base64url');
    const cipher = createDecipheriv(
      'aes-256-gcm',
      sessionKey(secret),
      data.subarray(0, 12),
    );
    cipher.setAAD(Buffer.from('das-admin-v1'));
    cipher.setAuthTag(data.subarray(12, 28));
    const value: Session = JSON.parse(
      Buffer.concat([
        cipher.update(data.subarray(28)),
        cipher.final(),
      ]).toString('utf8'),
    );
    return typeof value.username === 'string' &&
      typeof value.password === 'string' &&
      Number.isSafeInteger(value.userId) &&
      value.userId > 0 &&
      Number.isFinite(value.expires) &&
      value.expires > now &&
      value.expires <= now + lifetime * 1000 &&
      value.site === site
      ? value
      : null;
  } catch {
    return null;
  }
}
