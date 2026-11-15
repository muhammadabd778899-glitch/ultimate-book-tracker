import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, className, color = 'accent', showLabel = false }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn('w-full h-2.5 rounded-full bg-elevated overflow-hidden', className)}>
      <div
        className={cn('h-full transition-all duration-700 ease-out', `bg-${color}`)}
        style={{ width: `${pct}%` }}
      />
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-text-muted">
          <span>{Math.round(pct)}%</span>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
