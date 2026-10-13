import { text } from './values';
// Public WordPress content passes through wptexturize; edit-context content
// retains straight quotes. Internal matching must survive that transformation.
export function contentKey(value: string) {
  return text(value).replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}
export function profileKey(person: { name: string; photo?: { url: string } }) {
  return contentKey(JSON.stringify([person.name, person.photo?.url || '']));
}
export function publicationKey(publication: { title: string; html: string }) {
  return contentKey(
    JSON.stringify([publication.title, text(publication.html)]),
  );
}
export function updateKey(news: { title: string; link?: string }) {
  return contentKey(JSON.stringify([news.title, news.link || '']));
}
export function photoKey(photo: { url: string }) {
  return contentKey(JSON.stringify([photo.url]));
}
