import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sun, Moon, Monitor, Trash2, Sliders } from "lucide-react";
import { useCustomizer } from "../../context/CustomizerContext";

export const CustomizerPanel = ({ isOpen, onClose }) => {
  const {
    theme,
    setTheme,
    color,
    setColor,
    density,
    setDensity,
    layout,
    setLayout,
    resetDefaults
  } = useCustomizer();

  const colorOptions = [
    { id: "neutral", name: "Brand (Pink/T...", primary: "#F472B6", secondary: "#67C4C0" },
    { id: "zinc", name: "Sleek Zinc", primary: "#71717A", secondary: "#A1A1AA" },
    { id: "blue", name: "Zenith Blue", primary: "#3B82F6", secondary: "#10B981" },
    { id: "violet", name: "Royal Violet", primary: "#8B5CF6", secondary: "#EC4899" },
    { id: "rose", name: "Premium Rose", primary: "#F43F5E", secondary: "#06B6D4" },
    { id: "orange", name: "Warm Orange", primary: "#F97316", secondary: "#10B981" }
  ];

  const themeOptions = [
    { id: "light", name: "Light Mode", icon: Sun },
    { id: "dark", name: "Dark Mode", icon: Moon },
    { id: "system", name: "System Sync", icon: Monitor }
  ];

  const densityOptions = [
    { id: "compact", name: "Compact", desc: "For dashboard data-density" },
    { id: "comfortable", name: "Comfortable", desc: "Default balanced grid" },
    { id: "spacious", name: "Spacious", desc: "Wide premium breathing room" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: "#0B0B14" }}
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-[400px] shadow-2xl z-[101] flex flex-col overflow-hidden"
            style={{
              backgroundColor: "var(--card)",
              borderLeft: "1px solid var(--border)",
              color: "var(--text)"
            }}
          >
            {/* Header */}
            <div
              className="p-6 flex items-center justify-between flex-shrink-0"
              style={{
                borderBottom: "1px solid var(--border)",
                backgroundColor: "var(--bg)"
              }}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5" style={{ color: "var(--primary)" }} />
                <div>
                  <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>
                    UI Theme Customizer
                  </h3>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                    Configure real-time aesthetic values
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full transition-colors"
                style={{ color: "var(--muted)" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--border-light)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Settings */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 select-none">

              {/* Interface Theme */}
              <div className="flex flex-col gap-2.5">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--muted)" }}
                >
                  Interface Theme
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((opt) => {
                    const isSelected = theme === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-semibold transition-all duration-150"
                        style={{
                          borderColor: isSelected ? "var(--primary)" : "var(--border)",
                          backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                          color: isSelected ? "var(--primary)" : "var(--muted)"
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "var(--primary-xlight)";
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{opt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Profile */}
              <div className="flex flex-col gap-2.5">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--muted)" }}
                >
                  Accent Color Profile
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {colorOptions.map((opt) => {
                    const isSelected = color === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setColor(opt.id)}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs font-semibold transition-all duration-150"
                        style={{
                          borderColor: isSelected ? "var(--primary)" : "var(--border)",
                          backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                          color: isSelected ? "var(--primary)" : "var(--muted)"
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "var(--primary-xlight)";
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white"
                            style={{ backgroundColor: opt.primary }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white -ml-1.5"
                            style={{ backgroundColor: opt.secondary }}
                          />
                        </div>
                        <span className="truncate flex-1">{opt.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--primary)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Density */}
              <div className="flex flex-col gap-2.5">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--muted)" }}
                >
                  Layout Density
                </span>
                <div className="flex flex-col gap-2">
                  {densityOptions.map((opt) => {
                    const isSelected = density === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setDensity(opt.id)}
                        className="flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-150"
                        style={{
                          borderColor: isSelected ? "var(--primary)" : "var(--border)",
                          backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                          color: isSelected ? "var(--primary)" : "var(--muted)"
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "var(--primary-xlight)";
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-xs font-semibold truncate">{opt.name}</span>
                          <span className="text-[10px] truncate" style={{ color: "var(--hint)" }}>
                            {opt.desc}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Layout */}
              <div className="flex flex-col gap-2.5">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--muted)" }}
                >
                  Layout
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {/* Sidebar Option */}
                  {[{
                    id: "sidebar",
                    name: "Sidebar",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="8" height="20" rx="2" fill="currentColor" opacity="0.8"/>
                        <rect x="12" y="4" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.4"/>
                        <rect x="12" y="9" width="10" height="2" rx="1" fill="currentColor" opacity="0.3"/>
                        <rect x="12" y="13" width="12" height="2" rx="1" fill="currentColor" opacity="0.3"/>
                        <rect x="12" y="17" width="8" height="2" rx="1" fill="currentColor" opacity="0.3"/>
                      </svg>
                    )
                  }, {
                    id: "topnav",
                    name: "Top Nav",
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="24" height="5" rx="2" fill="currentColor" opacity="0.8"/>
                        <rect x="2" y="11" width="24" height="3" rx="1.5" fill="currentColor" opacity="0.4"/>
                        <rect x="2" y="16" width="18" height="2" rx="1" fill="currentColor" opacity="0.3"/>
                        <rect x="2" y="20" width="14" height="2" rx="1" fill="currentColor" opacity="0.3"/>
                      </svg>
                    )
                  }].map((opt) => {
                    const isSelected = layout === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setLayout(opt.id)}
                        className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border transition-all duration-150"
                        style={{
                          borderColor: isSelected ? "var(--primary)" : "var(--border)",
                          backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                          color: isSelected ? "var(--primary)" : "var(--hint)"
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "var(--primary-xlight)";
                            e.currentTarget.style.borderColor = "var(--primary)";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "var(--border)";
                          }
                        }}
                      >
                        {opt.icon}
                        <span
                          className="text-xs font-semibold"
                          style={{ color: isSelected ? "var(--primary)" : "var(--muted)" }}
                        >
                          {opt.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div
              className="p-4 flex items-center justify-between flex-shrink-0"
              style={{
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--bg)"
              }}
            >
              <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                Settings save automatically
              </span>
              <button
                onClick={resetDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.25)",
                  backgroundColor: "rgba(239,68,68,0.06)"
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.12)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Factory Defaults</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomizerPanel;
