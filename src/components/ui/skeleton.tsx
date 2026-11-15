import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface',
        className
      )}
    />
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className="w-6 h-6 text-accent animate-spin" />
    </div>
  );
}
