import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { lifetime, seal, sessionKey, unseal } from './session';
import { adminSite, currentUser } from './wordpress';
const name =
  process.env.NODE_ENV === 'production' ? '__Host-das-admin' : 'das-admin';
export function configured() {
  try {
    sessionKey(process.env.ADMIN_SESSION_SECRET || '');
    adminSite();
    return process.env.ADMIN_ENABLED === 'true';
  } catch {
    return false;
  }
}
export async function sameOrigin() {
  const h = await headers();
  const expected = new URL(process.env.SITE_URL || 'http://localhost:3000')
    .origin;
  if (h.get('origin') !== expected)
    throw new Error(
      'This request did not come from the website. Reload and try again.',
    );
}
export async function createSession(
  username: string,
  password: string,
  userId: number,
) {
  const session = {
    username,
    password,
    userId,
    site: adminSite(),
    expires: Date.now() + lifetime * 1000,
  };
  (await cookies()).set(
    name,
    seal(session, process.env.ADMIN_SESSION_SECRET!),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: lifetime,
    },
  );
}
export async function clearSession() {
  (await cookies()).delete(name);
}
export const signedIn = cache(async () => {
  if (!configured()) return null;
  const token = (await cookies()).get(name)?.value;
  const session = token
    ? unseal(token, process.env.ADMIN_SESSION_SECRET!, adminSite())
    : null;
  if (!session) return null;
  try {
    const user = await currentUser(session);
    return user.id === session.userId ? { session, user } : null;
  } catch {
    return null;
  }
});
export async function requireAdmin() {
  const auth = await signedIn();
  if (!auth) redirect('/admin/login');
  return auth;
}
