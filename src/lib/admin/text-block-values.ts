export type TextBlock = { start: number; end: number; value: string };
export function replaceTextBlocks(
  original: string,
  blocks: TextBlock[],
  values: string[],
) {
  const escape = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  let result = original;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    if (values[i] !== block.value)
      result =
        result.slice(0, block.start) +
        escape(values[i]) +
        result.slice(block.end);
  }
  return result;
}
