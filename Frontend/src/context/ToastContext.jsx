import React, { createContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type };

    setToasts((prev) => {
      // Keep max 3 toasts
      const updated = [...prev, newToast];
      if (updated.length > 3) {
        return updated.slice(updated.length - 3);
      }
      return updated;
    });

    // Auto dismiss after 3.5s
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Render Area */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => {
            let icon = <CheckCircle2 className="w-5 h-5 text-[#67C4C0]" />;
            let bgClass = "bg-[#E0F5F5] border-[#E0F5F5]";
            let textClass = "text-[#3FA8A4]";

            if (toast.type === "error") {
              icon = <AlertCircle className="w-5 h-5 text-[#EC4899]" />;
              bgClass = "bg-[#FCE7F3] border-[#FCE7F3]";
              textClass = "text-[#EC4899]";
            } else if (toast.type === "warning") {
              icon = <AlertTriangle className="w-5 h-5 text-[#F472B6]" />;
              bgClass = "bg-[#FDF2F8] border-[#FDF2F8]";
              textClass = "text-[#F472B6]";
            } else if (toast.type === "info") {
              icon = <Info className="w-5 h-5 text-[#F472B6]" />;
              bgClass = "bg-[#FCE7F3] border-[#FCE7F3]";
              textClass = "text-[#F472B6]";
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ x: 120, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 120, opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`flex items-start gap-3 p-4 rounded-card border shadow-card backdrop-blur-sm pointer-events-auto ${bgClass} overflow-hidden`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className={`flex-1 text-sm font-medium ${textClass}`}>
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-0.5 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-4 h-4 opacity-60 hover:opacity-100" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
