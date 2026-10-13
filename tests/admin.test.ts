import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { seal, unseal, lifetime, sessionKey } from '../src/lib/admin/session';
import {
  collection,
  recordId,
  payload,
  imageType,
} from '../src/lib/admin/records';
import { allowLogin } from '../src/lib/admin/login-limit';
const site = 'https://people.smu.edu/daslab',
  secret = randomBytes(32).toString('base64');
test('sessions encrypt credentials and bind authenticated identity to site and expiry', () => {
  const now = Date.now();
  const session = {
    username: 'editor',
    password: 'test-application-password',
    userId: 9,
    site,
    expires: now + lifetime * 1000,
  };
  const token = seal(session, secret);
  assert.ok(!token.includes(session.password));
  assert.deepEqual(unseal(token, secret, site, now), session);
  assert.equal(unseal(token, secret, site, session.expires), null);
  assert.equal(unseal(token, secret, 'https://other.example', now), null);
  assert.equal(
    unseal(token, randomBytes(32).toString('base64'), site, now),
    null,
  );
  const bytes = Buffer.from(token, 'base64url');
  bytes[bytes.length - 1] ^= 1;
  assert.equal(unseal(bytes.toString('base64url'), secret, site, now), null);
  assert.throws(() => sessionKey('short'));
});
test('malformed sessions cannot assert an identity or unbounded lifetime', () => {
  assert.equal(
    unseal(
      seal(
        {
          username: 'e',
          password: 'p',
          userId: 0,
          site,
          expires: Date.now() + 1000,
        },
        secret,
      ),
      secret,
      site,
    ),
    null,
  );
  assert.equal(
    unseal(
      seal(
        {
          username: 'e',
          password: 'p',
          userId: 1,
          site,
          expires: Date.now() + lifetime * 2000,
        },
        secret,
      ),
      secret,
      site,
    ),
    null,
  );
  assert.equal(unseal('x'.repeat(4000), secret, site), null);
});
test('collection and ID validation blocks arbitrary endpoints and invalid records', () => {
  assert.equal(collection('pages'), 'pages');
  for (const value of ['users', 'plugins', '../users', 'pages/6'])
    assert.throws(() => collection(value));
  for (const value of ['-1', 'NaN', '1.5', '6/../users', '9007199254740992'])
    assert.throws(() => recordId(value));
  assert.equal(recordId('0', true), 0);
  assert.throws(() => recordId('0'));
});
function form() {
  const value = new FormData();
  for (const [key, data] of Object.entries({
    title: 'Research',
    slug: 'research',
    content: '<!-- wp:paragraph --><p>Original</p><!-- /wp:paragraph -->',
    excerpt: '',
    status: 'publish',
    featured_media: '360',
    parent: '0',
    categories: '1, 2, 1',
    tags: '3',
  }))
    value.set(key, data);
  return value;
}
test('save payload preserves raw WordPress block markup and whitelists fields', () => {
  const data = form();
  data.set('author', '999');
  data.set('capabilities', 'administrator');
  const page = payload('pages', data);
  assert.equal(page.content, data.get('content'));
  assert.equal(page.featured_media, 360);
  assert.equal(page.author, undefined);
  assert.equal(page.capabilities, undefined);
  const post = payload('posts', data);
  assert.deepEqual(post.categories, [1, 2]);
  assert.deepEqual(post.tags, [3]);
  data.set('status', 'future');
  assert.throws(() => payload('posts', data));
  data.set('title', '');
  assert.throws(() => payload('pages', data));
});
test('image validation rejects disguised executable or vector content', () => {
  assert.equal(imageType(new Uint8Array([255, 216, 255])).mime, 'image/jpeg');
  assert.equal(
    imageType(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])).mime,
    'image/png',
  );
  assert.throws(() =>
    imageType(Buffer.from('<svg><script>alert(1)</script></svg>')),
  );
  assert.throws(() => imageType(Buffer.from('not a png')));
});
test('sign-in throttling groups equivalent usernames and expires', () => {
  for (let i = 0; i < 10; i++)
    assert.equal(allowLogin(' Unit-Editor ', 1), true);
  assert.equal(allowLogin('unit-editor', 2), false);
  assert.equal(allowLogin('unit-editor', 15 * 60 * 1000 + 2), true);
});
