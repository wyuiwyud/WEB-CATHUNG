import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast container - bottom centered on mobile, bottom right on desktop */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-5 z-50 flex flex-col gap-2.5 w-[92vw] max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            info: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
          };

          const typeStyles = {
            success: 'bg-emerald-50 border-emerald-200/80 text-emerald-950',
            error: 'bg-rose-50 border-rose-200/80 text-rose-950',
            warning: 'bg-amber-50 border-amber-200/80 text-amber-950',
            info: 'bg-indigo-50 border-indigo-200/80 text-indigo-950',
          };

          const currentType = toast.type || 'info';

          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-[16px] border shadow-[0_12px_30px_rgba(15,23,42,0.14)] animate-slide-up backdrop-blur-md',
                typeStyles[currentType]
              )}
            >
              <div className="flex items-center gap-2.5 text-sm font-medium leading-snug">
                {icons[currentType]}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
