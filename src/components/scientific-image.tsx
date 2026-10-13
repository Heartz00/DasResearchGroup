'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { Photo } from '@/lib/content/types';
export default function ScientificImage({
  photo,
  priority = false,
  className = '',
  sizes = '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 600px',
}: {
  photo: Photo;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        className={`image-fallback ${className}`}
        role="img"
        aria-label={photo.alt || 'Image currently unavailable'}
        style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      >
        <span>Image currently unavailable</span>
      </div>
    );
  return (
    <Image
      src={photo.url}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
