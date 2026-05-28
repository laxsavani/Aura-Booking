import React, { createContext, useContext, useState, useEffect } from "react";

const CustomizerContext = createContext(null);

export const CustomizerProvider = ({ children }) => {
  // Read initial states from localStorage or use defaults
  const [theme, setTheme] = useState(() => localStorage.getItem("aura-theme") || "light");
  const [color, setColor] = useState(() => localStorage.getItem("aura-color") || "neutral");
  const [density, setDensity] = useState(() => localStorage.getItem("aura-density") || "comfortable");
  const [layout, setLayout] = useState(() => localStorage.getItem("aura-layout") || "sidebar");
  const [container, setContainer] = useState(() => localStorage.getItem("aura-container") || "fluid");
  const [direction, setDirection] = useState(() => localStorage.getItem("aura-direction") || "ltr");
  const [language, setLanguage] = useState(() => localStorage.getItem("aura-language") || "en");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("aura-sidebar-collapsed") === "true";
  });

  // Color preset mapping
  const colorPresets = {
    neutral: {
      primary: "#F472B6",
      primaryDark: "#EC4899",
      primaryLight: "#FCE7F3",
      primaryXLight: "#FDF2F8",
      teal: "#67C4C0",
      tealDark: "#3FA8A4",
      tealLight: "#E0F5F5"
    },
    zinc: {
      primary: "#71717A",
      primaryDark: "#3F3F46",
      primaryLight: "#E4E4E7",
      primaryXLight: "#F4F4F5",
      teal: "#52525B",
      tealDark: "#27272A",
      tealLight: "#F4F4F5"
    },
    blue: {
      primary: "#3B82F6",
      primaryDark: "#1D4ED8",
      primaryLight: "#DBEAFE",
      primaryXLight: "#EFF6FF",
      teal: "#10B981",
      tealDark: "#047857",
      tealLight: "#D1FAE5"
    },
    violet: {
      primary: "#8B5CF6",
      primaryDark: "#6D28D9",
      primaryLight: "#EDE9FE",
      primaryXLight: "#F5F3FF",
      teal: "#EC4899",
      tealDark: "#BE123C",
      tealLight: "#FCE7F3"
    },
    rose: {
      primary: "#F43F5E",
      primaryDark: "#BE123C",
      primaryLight: "#FFE4E6",
      primaryXLight: "#FFF1F2",
      teal: "#06B6D4",
      tealDark: "#0891B2",
      tealLight: "#ECFEFF"
    },
    orange: {
      primary: "#F97316",
      primaryDark: "#C2410C",
      primaryLight: "#FFEDD5",
      primaryXLight: "#FFF7ED",
      teal: "#10B981",
      tealDark: "#047857",
      tealLight: "#D1FAE5"
    }
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("aura-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("aura-color", color);
  }, [color]);

  useEffect(() => {
    localStorage.setItem("aura-density", density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem("aura-layout", layout);
  }, [layout]);

  useEffect(() => {
    localStorage.setItem("aura-container", container);
  }, [container]);

  useEffect(() => {
    localStorage.setItem("aura-direction", direction);
  }, [direction]);

  useEffect(() => {
    localStorage.setItem("aura-language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("aura-sidebar-collapsed", sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  // Apply dark class and browser settings dynamically
  useEffect(() => {
    const root = document.documentElement;
    
    const applyDark = (isDark) => {
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    if (theme === "dark") {
      applyDark(true);
    } else if (theme === "light") {
      applyDark(false);
    } else {
      // System mode support
      const matcher = window.matchMedia("(prefers-color-scheme: dark)");
      applyDark(matcher.matches);

      const listener = (e) => applyDark(e.matches);
      matcher.addEventListener("change", listener);
      return () => matcher.removeEventListener("change", listener);
    }
  }, [theme]);

  // Apply Spacing density dynamically
  useEffect(() => {
    const body = document.body;
    body.classList.remove("density-compact", "density-comfortable", "density-spacious");
    body.classList.add(`density-${density}`);
  }, [density]);

  // Apply Text Direction (LTR / RTL) dynamically
  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  // Apply accent color palette custom CSS variable overrides dynamically
  useEffect(() => {
    const preset = colorPresets[color] || colorPresets.neutral;
    const root = document.documentElement;
    
    root.style.setProperty("--primary", preset.primary);
    root.style.setProperty("--primary-dark", preset.primaryDark);
    root.style.setProperty("--primary-light", preset.primaryLight);
    root.style.setProperty("--primary-xlight", preset.primaryXLight);
    root.style.setProperty("--teal", preset.teal);
    root.style.setProperty("--teal-dark", preset.tealDark);
    root.style.setProperty("--teal-light", preset.tealLight);
    root.style.setProperty("--shadow-btn", `0 4px 16px ${preset.primary}40`);
  }, [color]);

  const resetDefaults = () => {
    setTheme("light");
    setColor("neutral");
    setDensity("comfortable");
    setLayout("sidebar");
    setContainer("fluid");
    setDirection("ltr");
    setLanguage("en");
    setSidebarCollapsed(false);
  };

  return (
    <CustomizerContext.Provider
      value={{
        theme,
        setTheme,
        color,
        setColor,
        density,
        setDensity,
        layout,
        setLayout,
        container,
        setContainer,
        direction,
        setDirection,
        language,
        setLanguage,
        sidebarCollapsed,
        setSidebarCollapsed,
        resetDefaults
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};

export const useCustomizer = () => {
  const context = useContext(CustomizerContext);
  if (!context) {
    throw new Error("useCustomizer must be used within a CustomizerProvider");
  }
  return context;
};
