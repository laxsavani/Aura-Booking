import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, AlertCircle } from "lucide-react";

export const ConfirmModal = ({
  isOpen = false,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Delete",
  danger = true
}) => {
  // Prevent body scroll when modal is open
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

  const cardVariants = {
    initial: { opacity: 0, scale: 0.92, y: 16 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 28 } },
    exit: { opacity: 0, scale: 0.94, transition: { duration: 0.18 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onCancel}
            className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm z-[9900]"
          />

          {/* Modal Centered Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white border border-[#F9D0E8] rounded-[20px] p-7 w-full max-w-[400px] shadow-card-hover text-center pointer-events-auto"
            >
              {/* Icon Circle */}
              <div
                className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
                  danger ? "bg-[#FCE7F3]" : "bg-[#E0F5F5]"
                }`}
              >
                {danger ? (
                  <Trash2 className="w-[26px] h-[26px] text-[#EC4899]" />
                ) : (
                  <AlertCircle className="w-[26px] h-[26px] text-[#67C4C0]" />
                )}
              </div>

              {/* Title & Message */}
              <h3 className="text-[18px] font-semibold text-[#1A1A2E] mt-4">{title}</h3>
              <p className="text-sm text-[#6B6B8A] mt-2 leading-relaxed">{message}</p>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onCancel}
                  className="flex-1 h-11 border border-[#F9D0E8] text-[#F472B6] hover:bg-[#FDF2F8] text-sm font-semibold rounded-btn transition-colors duration-150"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onConfirm}
                  className={`flex-1 h-11 text-white text-sm font-semibold rounded-btn transition-colors duration-150 ${
                    danger
                      ? "bg-[#EC4899] hover:bg-[#D0357F]"
                      : "bg-[#67C4C0] hover:bg-[#3FA8A4]"
                  }`}
                >
                  {confirmText}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
