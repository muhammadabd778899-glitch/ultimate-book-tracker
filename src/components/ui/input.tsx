import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

export function Input({ label, error, helper, required, className, ...props }: InputProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label} {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(
          'flex h-11 w-full rounded-xl border border-input bg-surface px-4 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-danger focus:ring-danger',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {helper && !error && <p className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

export function Textarea({ label, error, helper, required, className, ...props }: TextareaProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label} {required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'min-h-[100px] w-full rounded-xl border border-input bg-surface px-4 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-danger focus:ring-danger',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {helper && !error && <p className="text-xs text-text-muted">{helper}</p>}
    </div>
  );
}
