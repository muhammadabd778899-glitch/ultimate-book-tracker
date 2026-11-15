import * as React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => onOpenChange(false)} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl border border-input bg-card shadow-cover animate-scale-in">
        <div className="p-6">
          {title && <h2 className="text-xl font-serif font-semibold text-text">{title}</h2>}
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
          <div className="mt-4">{children}</div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 rounded-xl p-2 text-text-secondary hover:text-text transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  destructive = false,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => onOpenChange(false)} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-input bg-card shadow-cover animate-scale-in">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text">{title}</h2>
          <p className="mt-2 text-sm text-text-secondary">{message}</p>
          <div className="mt-6 flex gap-2 justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 rounded-xl border border-input bg-surface text-text-secondary hover:bg-elevated"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className={`flex-1 h-10 rounded-xl bg-${destructive ? 'danger' : 'accent'} text-text hover:opacity-90`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 rounded-xl p-2 text-text-secondary hover:text-text transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
