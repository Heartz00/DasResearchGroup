import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  accessRole,
  editableAccount,
  allowedAdminPath,
} from '../src/lib/admin/access';
import { guidedFields } from '../src/lib/admin/guided-parser';
import { serializeFields } from '../src/lib/admin/guided-values';
import { textBlocks } from '../src/lib/admin/text-blocks';
import { replaceTextBlocks } from '../src/lib/admin/text-block-values';
test('role assignments cannot escalate or modify owners and institutional accounts', () => {
  assert.equal(accessRole('editor'), 'editor');
  assert.throws(() => accessRole('administrator'));
  assert.throws(() => accessRole('super_admin'));
  assert.throws(() => editableAccount(9, 9, ['editor']));
  assert.throws(() => editableAccount(10, 9, ['administrator']));
  assert.throws(() => editableAccount(10, 9, ['smu_owner']));
  assert.doesNotThrow(() => editableAccount(10, 9, ['contributor']));
});
test('WordPress request paths allow explicit user/content routes but not plugins or credentials', () => {
  for (const path of [
    'users',
    'users/9?context=edit',
    'users/me?context=edit',
    'pages/6/revisions?per_page=5',
    'posts/10',
    'media',
  ])
    assert.equal(allowedAdminPath(path), true);
  for (const path of [
    'users/9/application-passwords',
    'users/../plugins',
    'plugins',
    'users/me/../9',
    'pages/0',
    'pages/1/other',
  ])
    assert.equal(allowedAdminPath(path), false);
});
test('guided fields round-trip text while escaping HTML and preserving unsupported source', () => {
  const fields = [
    { label: 'Biography', value: 'A & B\n<not markup>' },
    { label: 'Email', value: 'lab@example.edu' },
  ];
  assert.deepEqual(guidedFields(serializeFields(fields)), fields);
  for (const html of [
    '<!-- wp:paragraph --><p>Text</p>',
    '<h2>Bio</h2><p><a href="/">Link</a></p>',
    '<h2 id="bio">Bio</h2><p>Text</p>',
    '<h2>Bio</h2><img src="/photo.png">',
    'orphan<h2>Bio</h2><p>Text</p>',
  ])
    assert.equal(guidedFields(html), null);
});
test('simple legacy edits preserve images, links and block markup byte for byte', () => {
  const html =
    '<!-- wp:paragraph --><p class="intro">First &amp; second</p><!-- /wp:paragraph --><p><a href="/paper">Paper</a><img src="/lab.jpg" alt="Lab"></p><p>Last text</p>';
  const blocks = textBlocks(html);
  assert.equal(blocks.length, 2);
  assert.equal(
    replaceTextBlocks(
      html,
      blocks,
      blocks.map((block) => block.value),
    ),
    html,
  );
  const edited = replaceTextBlocks(html, blocks, ['New <text>', 'Final text']);
  assert.ok(
    edited.includes(
      '<!-- wp:paragraph --><p class="intro">New &lt;text&gt;</p><!-- /wp:paragraph -->',
    ),
  );
  assert.ok(
    edited.includes(
      '<p><a href="/paper">Paper</a><img src="/lab.jpg" alt="Lab"></p>',
    ),
  );
  assert.ok(edited.endsWith('<p>Final text</p>'));
});
