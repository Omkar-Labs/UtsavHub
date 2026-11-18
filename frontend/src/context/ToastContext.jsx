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
          let bg = "bg-white border-[#E4E2DD] text-[#18181B] shadow-lg";
          let icon = <Info className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700 shrink-0" />;

          if (toast.type === "success") {
            bg = "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857] shadow-lg";
            icon = <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#047857] shrink-0" />;
          } else if (toast.type === "error") {
            bg = "bg-[#FFE4E6] border-[#FECDD3] text-[#BE123C] shadow-lg";
            icon = <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#BE123C] shrink-0" />;
          } else if (toast.type === "warning") {
            bg = "bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C] shadow-lg";
            icon = <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2410C] shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border backdrop-blur-md transition-all duration-300 animate-slide-in ${bg}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                {toast.title && <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 opacity-90">{toast.title}</p>}
                <p className="text-xs sm:text-sm font-medium leading-relaxed break-words">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 -mr-1 -mt-1 shrink-0"
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
