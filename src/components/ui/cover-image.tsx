import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { BookCover } from './book-cover';
import { generateFallbackCover } from '@/utils/cover';
import { Book } from 'lucide-react';

interface CoverImageProps {
  coverImageId?: string | null;
  /** Remote official cover, e.g. https://covers.openlibrary.org/... */
  coverUrl?: string | null;
  /** Used to draw an original cover when no artwork exists or it fails to load. */
  title?: string | null;
  author?: string | null;
  genre?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  radius?: 'md' | 'lg' | 'xl';
}

export function CoverImage({
  coverImageId,
  coverUrl,
  title,
  author,
  genre,
  alt = 'Book cover',
  className,
  width,
  height,
  radius = 'xl',
}: CoverImageProps) {
  const cover = (useLiveQuery(() => (coverImageId ? db.covers.get(coverImageId) : undefined), [coverImageId]) ?? null) as
    | { dataUrl: string }
    | null;
  const src = cover?.dataUrl ?? coverUrl ?? null;

  const fallback = useMemo(() => {
    if (!title) return null;
    return generateFallbackCover({
      title,
      author,
      genre,
      width: width ?? 400,
      height: height ?? 600,
    });
  }, [title, author, genre, width, height]);

  return (
    <BookCover
      src={src}
      fallbackSrc={fallback}
      alt={alt}
      className={className}
      width={width}
      height={height}
      radius={radius}
      loading={Boolean(coverImageId) && !cover && !coverUrl}
    />
  );
}

export function CoverFallback({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center text-text-muted opacity-50 ${className ?? ''}`}>
      <Book className="w-8 h-8" />
    </div>
  );
}
