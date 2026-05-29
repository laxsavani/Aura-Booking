import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CustomizerProvider } from "./context/CustomizerContext";
import AdminLayout from "./components/layout/AdminLayout";

// Lazy / direct page imports
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import AppointmentDetail from "./pages/AppointmentDetail";
import Services from "./pages/Services";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Banners from "./pages/Banners";

// Page Wrapper for consistent entry animations
export const PageWrapper = ({ children }) => {
  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25 } }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Animated Route Container
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />

        {/* Protected Routes (Wrapped in AdminLayout) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            }
          />
          <Route
            path="appointments"
            element={
              <PageWrapper>
                <Appointments />
              </PageWrapper>
            }
          />
          <Route
            path="appointments/:id"
            element={
              <PageWrapper>
                <AppointmentDetail />
              </PageWrapper>
            }
          />
          <Route
            path="services"
            element={
              <PageWrapper>
                <Services />
              </PageWrapper>
            }
          />
          <Route
            path="categories"
            element={
              <PageWrapper>
                <Categories />
              </PageWrapper>
            }
          />
          <Route
            path="users"
            element={
              <PageWrapper>
                <Users />
              </PageWrapper>
            }
          />
          <Route
            path="users/:id"
            element={
              <PageWrapper>
                <UserDetail />
              </PageWrapper>
            }
          />
          <Route
            path="notifications"
            element={
              <PageWrapper>
                <Notifications />
              </PageWrapper>
            }
          />
          <Route
            path="settings"
            element={
              <PageWrapper>
                <Settings />
              </PageWrapper>
            }
          />
          <Route
            path="banners"
            element={
              <PageWrapper>
                <Banners />
              </PageWrapper>
            }
          />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <CustomizerProvider>
        <AuthProvider>
          <ToastProvider>
            <AnimatedRoutes />
          </ToastProvider>
        </AuthProvider>
      </CustomizerProvider>
    </BrowserRouter>
  );
}
