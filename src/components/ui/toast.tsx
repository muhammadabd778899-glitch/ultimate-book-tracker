import toast, { Toaster as HotToaster, type ToastOptions } from 'react-hot-toast';

type ToastApi = {
  toast: {
    (message: string, options?: ToastOptions): string;
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    info: (message: string, options?: ToastOptions) => string;
  };
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  dismiss: () => number;
};

const boundToast = ((message: string, options?: ToastOptions) => t.toast(message, options)) as ToastApi['toast'];
boundToast.success = (message, options) => t.success(message, options);
boundToast.error = (message, options) => t.error(message, options);
boundToast.info = (message, options) => t.toast(message, options);

export function useToast(): ToastApi {
  return {
    toast: boundToast,
    success: t.success,
    error: t.error,
    dismiss: t.dismiss,
  };
}

export function Toaster() {
  return <HotToaster position="bottom-right" />;
}
