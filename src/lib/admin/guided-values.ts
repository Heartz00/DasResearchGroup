export type GuidedField = { label: string; value: string };
export function serializeFields(fields: GuidedField[]) {
  const escape = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  return fields
    .map(
      (field) =>
        `<h2>${escape(field.label)}</h2><p>${escape(field.value).replaceAll('\n', '<br>')}</p>`,
    )
    .join('\n');
}
