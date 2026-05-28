import React from "react";
import { motion } from "framer-motion";

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-[#FDF2F8] z-[99999] flex flex-col items-center justify-center select-none">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Logo Image */}
        <motion.img
          src="/Logo.png"
          alt="Aura Admin"
          className="h-14 object-contain"
          animate={{ scale: [0.96, 1.04, 0.96] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        />
        <p className="text-xs text-[#6B6B8A] tracking-[0.2em] uppercase font-semibold mt-2">
          Management Panel
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
