import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, Info, ShoppingBag, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-studio-dark text-white rounded-xl p-4 shadow-2xl border border-white/10 flex items-start gap-3 transform transition-all duration-300 animate-fadeIn backdrop-blur-md"
        >
          {toast.image ? (
            <img
              src={toast.image}
              alt=""
              className="w-12 h-14 object-cover rounded-md flex-shrink-0 border border-white/10"
            />
          ) : (
            <div className="p-2 bg-white/10 rounded-full flex-shrink-0 text-studio-terracotta">
              {toast.type === 'cart' ? (
                <ShoppingBag className="w-5 h-5 text-amber-400" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-sky-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold tracking-wide text-white">{toast.title}</h4>
            <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed truncate">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
