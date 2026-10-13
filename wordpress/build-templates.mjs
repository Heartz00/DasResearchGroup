import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { models } from './content-model.mjs';
const root = new URL('./native-templates/', import.meta.url);
await mkdir(root, { recursive: true });
const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
const reference = [
  '# Native WordPress field reference',
  '',
  'Generated from `wordpress/content-model.mjs`. Blank block templates contain no example claims and are never loaded as public content. Follow [ADMIN_GUIDE.md](ADMIN_GUIDE.md) before publishing.',
  '',
];
for (const [key, model] of Object.entries(models)) {
  const html = model.fields
    .map(
      (field) =>
        `<!-- wp:heading -->\n<h2 class="wp-block-heading">${escape(field.label)}</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p></p>\n<!-- /wp:paragraph -->`,
    )
    .join('\n\n');
  await writeFile(new URL(`${key}.html`, root), html + '\n');
  reference.push(
    `## ${model.title}`,
    '',
    `${model.kind}${model.slug ? `; slug: \`${model.slug}\`` : ''}${model.parent ? `; Parent: ${model.parent}` : ''}${model.category ? `; category slug: \`${model.category}\`` : ''}.`,
    '',
    '| Heading 2 | Help |',
    '| --- | --- |',
    ...model.fields.map((f) => `| ${f.label} | ${f.help} |`),
    '',
  );
}
await writeFile(
  new URL('../docs/NATIVE_FIELD_REFERENCE.md', import.meta.url),
  reference.join('\n'),
);
console.log(
  `Generated ${Object.keys(models).length} native editor templates at ${fileURLToPath(root)}`,
);
