import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export const StatCard = ({
  value,
  label,
  icon: Icon,
  color = "#67C4C0",
  trend,
  trendValue,
  sparklineData
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericTarget = typeof value === "number" ? value : parseInt(value) || 0;
  const isStringValue = typeof value === "string" && isNaN(Number(value));

  useEffect(() => {
    if (isStringValue) {
      return;
    }
    
    let start = 0;
    const end = numericTarget;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 800; // ms
    const incrementTime = 16; // ms (~60fps)
    const steps = Math.ceil(duration / incrementTime);
    const stepValue = (end - start) / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start + (stepValue * currentStep)));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [numericTarget, isStringValue]);

  // Mini sparkline data generator for premium look matching Zenith Shadcn
  const chartData = React.useMemo(() => {
    if (sparklineData && sparklineData.length > 0) return sparklineData;
    const seed = label.charCodeAt(0) + label.charCodeAt(label.length - 1);
    const wave = [];
    let current = 20 + (seed % 30);
    for (let i = 0; i < 9; i++) {
      const direction = i % 2 === 0 ? 1 : -1;
      const step = ((seed + i) * 7) % 15;
      current = Math.max(10, Math.min(80, current + direction * step));
      wave.push({ val: current });
    }
    return wave;
  }, [sparklineData, label]);

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "var(--shadow-hover)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="rounded-xl p-5 flex flex-col justify-between cursor-pointer select-none overflow-hidden relative"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        transition: "background-color 0.25s ease, border-color 0.25s ease"
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col z-10">
          <span className="text-[13px] font-medium" style={{ color: "var(--muted)" }}>{label}</span>
          <span className="text-3xl font-bold mt-2" style={{ color: "var(--text)" }}>
            {isStringValue ? value : displayValue}
          </span>
        </div>
        
        {/* Icon Circle */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10"
          style={{ backgroundColor: `${color}12` }}
        >
          {Icon && <Icon className="w-[22px] h-[22px]" style={{ color }} />}
        </div>
      </div>

      {/* Sparkline Wave Chart - Zenith style */}
      <div className="w-full h-10 mt-3 -mb-1 overflow-hidden opacity-75">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${label.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="val"
              stroke={color}
              strokeWidth={1.5}
              fillOpacity={1}
              fill={`url(#gradient-${label.replace(/\s+/g, '-')})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {trend && (
        <div
          className="flex items-center gap-1.5 mt-3 pt-3 z-10"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--teal)" }} />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
          )}
          <span
            className="text-xs font-semibold"
            style={{ color: trend === "up" ? "var(--teal)" : "var(--primary)" }}
          >
            {trendValue}
          </span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
