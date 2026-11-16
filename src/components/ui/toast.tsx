import baseToast, { Toaster as HotToaster, type ToastOptions } from 'react-hot-toast';

type ToastOptionsArg = ToastOptions;

export type ToastApi = {
  toast: {
    (message: string, options?: ToastOptionsArg): string;
    success: (message: string, options?: ToastOptionsArg) => string;
    error: (message: string, options?: ToastOptionsArg) => string;
    info: (message: string, options?: ToastOptionsArg) => string;
  };
  success: (message: string, options?: ToastOptionsArg) => string;
  error: (message: string, options?: ToastOptionsArg) => string;
  info: (message: string, options?: ToastOptionsArg) => string;
  dismiss: (id?: string) => void;
};

const boundToast = ((message: string, options?: ToastOptionsArg) => baseToast(message, options)) as ToastApi['toast'];
boundToast.success = (message, options) => baseToast.success(message, options);
boundToast.error = (message, options) => baseToast.error(message, options);
boundToast.info = (message, options) => baseToast(message, { ...options, icon: 'i' });

export function useToast(): ToastApi {
  return {
    toast: boundToast,
    success: (message, options) => baseToast.success(message, options),
    error: (message, options) => baseToast.error(message, options),
    info: (message, options) => baseToast(message, options),
    dismiss: (id) => baseToast.dismiss(id),
  };
}

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--surface, #fff)',
          color: 'var(--text, #1b1b1f)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '14px',
          boxShadow: '0 12px 32px rgba(16,24,40,0.14)',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: { iconTheme: { primary: '#2f9e6e', secondary: '#fff' } },
        error: { iconTheme: { primary: '#d04545', secondary: '#fff' } },
      }}
    />
  );
}
