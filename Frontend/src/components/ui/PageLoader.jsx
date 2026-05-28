import React from "react";
import { motion } from "framer-motion";

export const PageLoader = () => {
  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none"
      style={{
        background: "radial-gradient(circle at center, var(--primary-xlight) 0%, var(--bg) 100%)",
        transition: "background-color 0.25s ease"
      }}
    >
      {/* Ambient Pulsating Glow */}
      <motion.div
        className="absolute w-72 h-72 rounded-full filter blur-3xl pointer-events-none"
        style={{ backgroundColor: "var(--primary-light)" }}
        animate={{
          scale: [0.9, 1.15, 0.9],
          opacity: [0.3, 0.45, 0.3]
        }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut"
        }}
      />

      <div className="flex flex-col items-center relative z-10">
        {/* Floating Logo Image */}
        <motion.img
          src="/Logo.png"
          alt="Aura Admin"
          className="h-14 object-contain"
          animate={{
            y: [0, -6, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut"
          }}
        />
        
        {/* Pulsating Subtitle */}
        <motion.p
          className="text-[10px] tracking-[0.22em] uppercase font-bold mt-3"
          style={{ color: "var(--muted)" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          Loading Management Panel Data.....
        </motion.p>

        {/* Elegant Gradient Indeterminate Progress Bar */}
        <div
          className="w-32 h-[3px] rounded-full overflow-hidden mt-6 relative"
          style={{ backgroundColor: "var(--border)" }}
        >
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#F472B6] to-[#67C4C0] rounded-full"
            style={{ width: "40%" }}
            animate={{
              x: ["-100%", "250%"]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
