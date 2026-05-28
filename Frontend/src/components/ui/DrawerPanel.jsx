import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XCircle } from "lucide-react";

export const DrawerPanel = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer
}) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const drawerVariants = {
    initial: { x: "100%", opacity: 0.5 },
    animate: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 30 } },
    exit: { x: "100%", opacity: 0.5, transition: { duration: 0.25 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Mask */}
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1A2E]/30 backdrop-blur-sm z-[990] cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed right-0 top-0 h-full bg-white border-l border-[#F9D0E8] shadow-[-8px_0_40px_rgba(244,114,182,0.12)] z-[999] flex flex-col w-full max-w-[480px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F9D0E8] flex-shrink-0">
              <h2 className="text-lg font-semibold text-[#1A1A2E]">{title}</h2>
              <button
                onClick={onClose}
                className="text-[#A8A8C0] hover:text-[#EC4899] transition-colors duration-150 p-1 rounded-full hover:bg-black/5"
              >
                <XCircle className="w-[22px] h-[22px]" />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-[#F9D0E8] bg-[#FDF2F8]/30 flex items-center justify-end gap-3 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DrawerPanel;
