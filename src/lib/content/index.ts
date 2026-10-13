import 'server-only';
import { getContent } from '../wordpress/client';
import { normalizeSite } from './normalize';

export async function getSite() {
  return normalizeSite(await getContent());
}
export type Site = Awaited<ReturnType<typeof getSite>>;
