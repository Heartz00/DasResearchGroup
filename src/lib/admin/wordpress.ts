import 'server-only';
import type { Session } from './session';
import { allowedAdminPath } from './access';
export type WPUser = {
  id: number;
  name: string;
  capabilities: Record<string, boolean>;
  username?: string;
  email?: string;
  roles?: string[];
};
export function adminSite() {
  const url = new URL(
    process.env.WORDPRESS_URL || 'https://people.smu.edu/daslab',
  );
  const localTest =
    process.env.NODE_ENV !== 'production' &&
    process.env.ADMIN_ALLOW_LOCAL_TEST_SERVER === 'true' &&
    ['127.0.0.1', 'localhost'].includes(url.hostname);
  if (url.protocol !== 'https:' && !localTest)
    throw new Error('Content administration requires HTTPS.');
  if (url.username || url.password || url.search || url.hash)
    throw new Error('Invalid content service URL');
  return url.href.replace(/\/$/, '');
}
export async function wp<T>(
  path: string,
  session: Pick<Session, 'username' | 'password'>,
  init: RequestInit = {},
): Promise<{ data: T; pages: number }> {
  if (!allowedAdminPath(path)) throw new Error('Invalid content service route');
  let response: Response;
  try {
    response = await fetch(`${adminSite()}/wp-json/wp/v2/${path}`, {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init.headers)),
        Authorization: `Basic ${Buffer.from(`${session.username}:${session.password}`).toString('base64')}`,
      },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(
      'The content service could not be reached. Check the connection and try again.',
    );
  }
  if (!response.ok) {
    const messages: Record<number, string> = {
      401: 'Your editing access was rejected. Sign in again with your personal access key.',
      403: 'Your account does not have permission for this action.',
      404: 'This item could not be found.',
      413: 'This file is too large.',
      429: 'The content service is busy. Wait a moment and try again.',
    };
    throw new Error(
      messages[response.status] ||
        'Your changes could not be saved. Check the fields, try again or ask the website manager.',
    );
  }
  return {
    data: (await response.json()) as T,
    pages: Math.max(1, Number(response.headers.get('X-WP-TotalPages')) || 1),
  };
}
export async function currentUser(
  session: Pick<Session, 'username' | 'password'>,
) {
  const { data } = await wp<WPUser>('users/me?context=edit', session);
  if (
    !Number.isSafeInteger(data.id) ||
    !data.capabilities ||
    !['edit_pages', 'edit_posts', 'upload_files'].some(
      (key) => data.capabilities[key],
    )
  )
    throw new Error('An account with editing access is required.');
  return data;
}
