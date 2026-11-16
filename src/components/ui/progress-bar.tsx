import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'accent' | 'gold' | 'success' | 'danger' | 'text';
  showLabel?: boolean;
}

const FILL: Record<NonNullable<ProgressBarProps['color']>, string> = {
  accent: 'bg-accent',
  gold: 'bg-gold',
  success: 'bg-success',
  danger: 'bg-danger',
  text: 'bg-text',
};

export function ProgressBar({ value, max = 100, className, color = 'accent', showLabel = false }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="w-full">
      <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-elevated', className)}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', FILL[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-text-muted">
          <span>{Math.round(pct)}%</span>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
