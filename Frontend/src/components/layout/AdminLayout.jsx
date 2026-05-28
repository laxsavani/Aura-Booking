import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import TopNavBar from "./TopNavBar";
import CustomizerPanel from "./CustomizerPanel";
import { useCustomizer } from "../../context/CustomizerContext";

export const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const { layout } = useCustomizer();

  const isTopNav = layout === "topnav";
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden font-sans"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        transition: "background-color 0.25s ease, color 0.25s ease"
      }}
    >
      {/* ── TOP NAV LAYOUT ───────────────────────────────────────── */}
      {isTopNav ? (
        <>
          <TopNavBar onOpenCustomizer={() => setIsCustomizerOpen(true)} />

          {/* Page content — full width, no sidebar */}
          <main
            className="flex-1 overflow-y-auto admin-main"
            style={{
              backgroundColor: "var(--bg)",
              padding: "32px",
              transition: "background-color 0.25s ease"
            }}
          >
            <Outlet />
          </main>
        </>
      ) : (
        /* ── SIDEBAR LAYOUT ──────────────────────────────────────── */
        <div className="flex flex-row h-full w-full overflow-hidden">
          {/* Desktop Sidebar */}
          <div
            className="hidden lg:block flex-shrink-0 h-full"
            style={{ overflow: "visible", zIndex: 40, transition: "width 0.3s ease" }}
          >
            <Sidebar />
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={toggleMobileSidebar}
                  className="fixed inset-0 z-[90] lg:hidden"
                  style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="fixed left-0 top-0 h-full z-[99] lg:hidden"
                >
                  <Sidebar isMobileOpen={true} toggleSidebar={toggleMobileSidebar} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Topbar
              toggleSidebar={toggleMobileSidebar}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
            />

            <main
              className="flex-1 overflow-y-auto admin-main"
              style={{
                backgroundColor: "var(--bg)",
                padding: "32px",
                transition: "background-color 0.25s ease"
              }}
            >
              <Outlet />
            </main>
          </div>
        </div>
      )}

      {/* Customizer Drawer — always available */}
      <CustomizerPanel isOpen={isCustomizerOpen} onClose={() => setIsCustomizerOpen(false)} />
    </div>
  );
};

export default AdminLayout;
