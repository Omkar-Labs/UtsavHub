import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", title = "") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 inset-x-0 mx-auto px-4 sm:bottom-5 sm:right-5 sm:left-auto sm:mx-0 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          let bg = "bg-stone-900 border-stone-800 text-stone-200";
          let icon = <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />;

          if (toast.type === "success") {
            bg = "bg-[#14231b] border-emerald-800/60 text-emerald-100";
            icon = <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />;
          } else if (toast.type === "error") {
            bg = "bg-[#291415] border-rose-800/60 text-rose-100";
            icon = <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0" />;
          } else if (toast.type === "warning") {
            bg = "bg-[#2b2011] border-amber-800/60 text-amber-100";
            icon = <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in ${bg}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                {toast.title && <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5">{toast.title}</p>}
                <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-200 transition-colors p-1 -mr-1 -mt-1 shrink-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
