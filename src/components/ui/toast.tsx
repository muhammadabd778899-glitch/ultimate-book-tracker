import toast, { Toaster as HotToaster, type ToastOptions } from 'react-hot-toast';

export function useToast() {
  return {
    toast: (message: string, options?: ToastOptions) =>
      toast(message, {
        duration: 4000,
        position: 'bottom-right',
        style: {
          borderRadius: '12px',
          background: '#22222b',
          color: '#f7f5f2',
          border: '1px solid #30303a',
          padding: '12px 16px',
          fontSize: '14px',
          ...options.style,
        },
        iconTheme: {
          primary: '#e65a45',
          secondary: '#f7f5f2',
        },
        ...options,
      }),
    success: (message: string, options?: ToastOptions) =>
      toast.success(message, {
        duration: 4000,
        position: 'bottom-right',
        style: {
          borderRadius: '12px',
          background: '#22222b',
          color: '#f7f5f2',
          border: '1px solid #30303a',
          ...options.style,
        },
        iconTheme: {
          primary: '#58b88a',
          secondary: '#f7f5f2',
        },
        ...options,
      }),
    error: (message: string, options?: ToastOptions) =>
      toast.error(message, {
        duration: 5000,
        position: 'bottom-right',
        style: {
          borderRadius: '12px',
          background: '#22222b',
          color: '#f7f5f2',
          border: '1px solid #30303a',
          ...options.style,
        },
        iconTheme: {
          primary: '#e05c61',
          secondary: '#f7f5f2',
        },
        ...options,
      }),
    dismiss: toast.dismiss,
  };
}

export function Toaster() {
  return <HotToaster position="bottom-right" richColors />;
}
