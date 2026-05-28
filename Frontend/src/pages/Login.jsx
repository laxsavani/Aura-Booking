import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, XCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import api from "../api/axios";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shakeTrigger, setShakeTrigger] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all credentials.");
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/auth/login", { email, password });
      
      if (res.data?.success) {
        const { token, user } = res.data.data;
        
        if (user.role === "admin") {
          login(token, user);
          addToast("Sign in successful. Welcome to Aura Admin!", "success");
          navigate("/dashboard");
        } else {
          setErrorMsg("Access denied. Admin accounts only.");
          triggerShake();
        }
      } else {
        setErrorMsg(res.data?.message || "Invalid credentials.");
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Network error. Please try again later.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setShakeTrigger(true);
    setTimeout(() => setShakeTrigger(false), 500);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-screen bg-[#FDF2F8] flex items-center justify-center p-4 select-none overflow-x-hidden font-sans">
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        animate={shakeTrigger ? { x: [-10, 10, -10, 10, -5, 5, 0] } : "animate"}
        transition={shakeTrigger ? { duration: 0.4 } : undefined}
        className="w-full max-w-[420px] bg-white border border-[#F9D0E8] rounded-[20px] p-8 md:p-10 shadow-card-hover"
      >
        {/* Logo center */}
        <div className="flex flex-col items-center gap-2 text-center select-none">
          <img src="/Logo.png" alt="Aura Admin" className="h-12 object-contain" />
          {/* Decorative bar */}
          <div className="h-[3px] bg-gradient-to-r from-[#F472B6] to-[#67C4C0] rounded-pill w-16 mt-2" />
        </div>

        {/* Heading */}
        <div className="text-center mt-6">
          <h2 className="text-[25px] font-display font-semibold text-[#1A1A2E]">
            Admin Sign In
          </h2>
          <p className="text-xs text-[#6B6B8A] mt-1">
            Access the Aura Booking management panel
          </p>
        </div>

        {/* Error box */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="mt-5 p-3.5 bg-[#FCE7F3] border border-[#FCE7F3] rounded-[10px] text-[#EC4899] text-xs font-semibold flex items-start gap-2.5"
            >
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B6B8A] px-1">
              Email Address <span className="text-[#EC4899] font-bold">*</span>
            </label>
            <div className="relative h-12">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aurabooking.com"
                className="w-full h-full pl-11 pr-4 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none focus:ring-4 focus:ring-[#F472B6]/15 transition-all duration-150"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B6B8A] px-1">
              Password <span className="text-[#EC4899] font-bold">*</span>
            </label>
            <div className="relative h-12">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-full pl-11 pr-11 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none focus:ring-4 focus:ring-[#F472B6]/15 transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A8A8C0] hover:text-[#F472B6] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 6px 24px rgba(244,114,182,0.35)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#F472B6] hover:bg-[#EC4899] text-white text-[15px] font-semibold rounded-btn shadow-btn flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight className="w-4.5 h-4.5" />
              </span>
            )}
          </motion.button>
        </form>

        <p className="text-[11px] text-[#A8A8C0] text-center mt-6">
          🔒 Restricted to authorized administrators only
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
