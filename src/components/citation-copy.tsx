'use client';
import { useEffect, useRef, useState } from 'react';

export default function CitationCopy({
  citation,
  title,
}: {
  citation: string;
  title: string;
}) {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <span className="citation-copy">
      <button
        type="button"
        className="text-link"
        aria-label={`Copy citation: ${title}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(citation);
            setMessage('Citation copied');
          } catch {
            setMessage(
              'Copy unavailable. Select the citation text to copy it.',
            );
          }
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setMessage(''), 4000);
        }}
      >
        Copy citation
      </button>
      <span role="status">{message}</span>
    </span>
  );
}
