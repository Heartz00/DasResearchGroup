import { text, safeUrl } from './values';

export function fieldEmail(value: string) {
  return /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w.-]+\.[a-z]{2,}$/i.test(value.trim())
    ? value.trim()
    : undefined;
}
export function fieldYear(html?: string) {
  const value = text(html ?? '');
  return /^(19|20)\d{2}$/.test(value) ? Number(value) : undefined;
}
export function fieldOrder(html?: string) {
  const value = Number(text(html ?? ''));
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
export function fieldBoolean(html?: string) {
  return /^(yes|true|1)$/i.test(text(html ?? ''));
}
export function fieldLink(html?: string) {
  return safeUrl(text(html ?? ''));
}
export function fieldDoi(html?: string) {
  const value = text(html ?? '').replace(
    /^https?:\/\/(?:dx\.)?doi\.org\//i,
    '',
  );
  return /^10\.\d{4,9}\/\S+$/i.test(value) ? value : undefined;
}
