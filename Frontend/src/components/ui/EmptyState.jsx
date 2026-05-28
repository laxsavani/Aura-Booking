import React from "react";
import { motion } from "framer-motion";

export const EmptyState = ({
  icon: Icon,
  title = "No data found",
  subtitle = "Adjust your filters or add new entries to get started.",
  ctaText,
  ctaAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 max-w-md mx-auto">
      {/* Icon Circle */}
      {Icon && (
        <div className="w-[72px] h-[72px] rounded-full bg-[#FCE7F3] flex items-center justify-center">
          <Icon className="w-8 h-8 text-[#F472B6]" />
        </div>
      )}

      <h3 className="text-base font-semibold text-[#1A1A2E] mt-4">{title}</h3>
      <p className="text-[13px] text-[#6B6B8A] mt-1.5 leading-relaxed">{subtitle}</p>

      {ctaText && ctaAction && (
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 6px 24px rgba(244,114,182,0.30)" }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          onClick={ctaAction}
          className="mt-5 px-5 py-2.5 bg-[#F472B6] hover:bg-[#EC4899] text-white text-sm font-semibold rounded-btn shadow-btn transition-colors duration-150"
        >
          {ctaText}
        </motion.button>
      )}
    </div>
  );
};

export default EmptyState;
