import * as React from 'react';
import { cn } from '@/lib/utils';
import { Image, ImageProps } from 'lucide-react';

interface BookCoverProps {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  radius?: 'md' | 'lg' | 'xl';
}

const RADIUS: Record<string, string> = {
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
};

export function BookCover({ src, alt = 'Book cover', className, width, height, radius = 'xl' }: BookCoverProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface',
        RADIUS[radius],
        className,
        width ? `w-[${width}px]` : 'w-full',
        height ? `h-[${height}px]` : 'aspect-[2/3]'
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn('w-full h-full object-cover', 'animate-pulse')}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-muted">
          <Image className="w-12 h-12 opacity-50" />
        </div>
      )}
    </div>
  );
}

export default BookCover;
