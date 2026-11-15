import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { BookCover } from './book-cover';
import { Book } from 'lucide-react';

interface CoverImageProps {
  coverImageId?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  radius?: 'md' | 'lg' | 'xl';
}

export function CoverImage({ coverImageId, alt = 'Book cover', className, width, height, radius = 'xl' }: CoverImageProps) {
  const cover = useLiveQuery(() => (coverImageId ? db.covers.get(coverImageId) : null), [coverImageId]);
  const src = cover?.dataUrl ?? null;
  return (
    <BookCover src={src} alt={alt} className={className} width={width} height={height} radius={radius} />
  );
}

export function CoverFallback({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center text-text-muted opacity-50 ${className ?? ''}`}>
      <Book className="w-8 h-8" />
    </div>
  );
}
