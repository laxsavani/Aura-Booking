import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const user = localStorage.getItem("aura_admin_user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem("aura_admin_token") || null;
  });

  const login = (newToken, newUser) => {
    localStorage.setItem("aura_admin_token", newToken);
    localStorage.setItem("aura_admin_user", JSON.stringify(newUser));
    setToken(newToken);
    setAdmin(newUser);
  };

  const logout = () => {
    localStorage.removeItem("aura_admin_token");
    localStorage.removeItem("aura_admin_user");
    setToken(null);
    setAdmin(null);
    window.location.href = "/login";
  };

  const isAuthenticated = !!token && admin?.role === "admin";

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
