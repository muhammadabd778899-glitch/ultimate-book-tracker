import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Image } from 'lucide-react';

interface BookCoverProps {
  src?: string | null;
  /** Generated artwork shown behind the remote cover and used if it fails. */
  fallbackSrc?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  radius?: 'md' | 'lg' | 'xl';
  loading?: boolean;
}

const RADIUS: Record<string, string> = {
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
};

export function BookCover({
  src,
  fallbackSrc,
  alt = 'Book cover',
  className,
  width,
  height,
  radius = 'xl',
  loading,
}: BookCoverProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const remote = src && failedSrc !== src ? src : null;
  const fallback = fallbackSrc && failedSrc !== fallbackSrc ? fallbackSrc : null;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface ring-1 ring-black/10',
        RADIUS[radius],
        !height && 'aspect-[2/3]',
        !width && 'w-full',
        className
      )}
      style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}
    >
      {fallback && (
        <img
          src={fallback}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {remote && (
        <img
          src={remote}
          alt={alt}
          className="relative h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(remote)}
        />
      )}
      {!remote && !fallback && loading && <div className="h-full w-full animate-pulse bg-border/40" />}
      {!remote && !fallback && !loading && (
        <div className="flex h-full w-full items-center justify-center text-text-muted">
          <Image className="h-12 w-12 opacity-50" />
        </div>
      )}
    </div>
  );
}

export default BookCover;
