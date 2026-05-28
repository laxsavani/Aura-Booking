import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  Sparkles,
  Tag,
  Users,
  Bell,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCustomizer } from "../../context/CustomizerContext";
import Avatar from "../ui/Avatar";
import ConfirmModal from "../ui/ConfirmModal";
import api from "../../api/axios";

export const Sidebar = ({ isMobileOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useCustomizer();
  const [pendingCount, setPendingCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.get("/appointments/admin/all?status=Pending");
        if (res.data?.success) {
          setPendingCount(res.data.data.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch pending count for sidebar", err);
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/appointments", label: "Appointments", icon: CalendarCheck, badge: pendingCount },
    { path: "/services", label: "Services", icon: Sparkles },
    { path: "/categories", label: "Categories", icon: Tag },
    { path: "/users", label: "Users", icon: Users },
    { path: "/notifications", label: "Notifications", icon: Bell }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (toggleSidebar) toggleSidebar();
  };

  const isCollapsed = sidebarCollapsed && !isMobileOpen;
  const sidebarWidth = isCollapsed ? "72px" : "260px";

  return (
    <>
      <div
        className="h-full flex flex-col select-none transition-all duration-300 ease-in-out relative"
        style={{
          width: sidebarWidth,
          backgroundColor: "var(--card)",
          borderRight: "1px solid var(--border)",
          overflow: "visible"
        }}
      >
        {/* Collapse Toggle Button */}
        {!isMobileOpen && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3.5 z-50 w-7 h-7 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              top: isCollapsed ? "86px" : "105px"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "var(--primary-light)";
              e.currentTarget.style.color = "var(--primary)";
              e.currentTarget.style.borderColor = "var(--primary)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "var(--card)";
              e.currentTarget.style.color = "var(--muted)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            {isCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        )}

        {/* Logo */}
        <div
          onClick={() => navigate("/dashboard")}
          className="py-5 flex flex-col gap-1.5 flex-shrink-0 cursor-pointer"
          style={{
            padding: isCollapsed ? "20px 8px" : "20px 24px",
            borderBottom: "1px solid var(--border)"
          }}
        >
          {isCollapsed ? (
            <img src="/favicon.png" alt="Aura" className="h-9 w-9 object-contain mx-auto" />
          ) : (
            <>
              <img src="/Logo.png" alt="Aura Admin" className="h-10 object-contain self-start" />
              <span
                className="text-[9px] tracking-[0.18em] uppercase font-semibold mt-1 ml-[46px]"
                style={{ color: "var(--muted)" }}
              >
                Management Panel
              </span>
            </>
          )}
        </div>


        {/* Nav Items */}
        <div
          className="flex-1 flex flex-col gap-5 py-5 overflow-y-auto"
          style={{ padding: isCollapsed ? "20px 8px" : "20px 12px" }}
        >
          <div className="flex flex-col gap-1.5">
            {!isCollapsed && (
              <span
                className="text-[9px] font-bold uppercase tracking-[0.2em] px-3"
                style={{ color: "var(--hint)" }}
              >
                Main Menu
              </span>
            )}
            <div className="flex flex-col gap-1 mt-1">
              {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <motion.div
                    key={item.path}
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => handleNavClick(item.path)}
                    className="flex items-center rounded-lg cursor-pointer transition-colors duration-150 relative"
                    style={{
                      padding: isCollapsed ? "12px" : "10px 14px",
                      justifyContent: isCollapsed ? "center" : "space-between",
                      backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                      color: isActive ? "var(--primary)" : "var(--muted)"
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "var(--primary-xlight)";
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className="w-[18px] h-[18px] flex-shrink-0"
                        style={{ color: isActive ? "var(--primary)" : "var(--hint)" }}
                      />
                      {!isCollapsed && (
                        <span className="text-xs font-semibold">{item.label}</span>
                      )}
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      isCollapsed ? (
                        <span
                          className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: "var(--primary)" }}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: isActive ? "var(--primary)" : "var(--primary-light)",
                            color: isActive ? "#fff" : "var(--primary)"
                          }}
                        >
                          {item.badge}
                        </span>
                      )
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-auto">
            {!isCollapsed && (
              <span
                className="text-[9px] font-bold uppercase tracking-[0.2em] px-3"
                style={{ color: "var(--hint)" }}
              >
                Account
              </span>
            )}
            <div className="flex flex-col gap-1 mt-1">
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => handleNavClick("/settings")}
                className="flex items-center rounded-lg cursor-pointer transition-colors duration-150"
                style={{
                  padding: isCollapsed ? "12px" : "10px 14px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  gap: isCollapsed ? 0 : "12px",
                  backgroundColor: location.pathname.startsWith("/settings") ? "var(--primary-light)" : "transparent",
                  color: location.pathname.startsWith("/settings") ? "var(--primary)" : "var(--muted)"
                }}
                onMouseEnter={e => {
                  if (!location.pathname.startsWith("/settings")) e.currentTarget.style.backgroundColor = "var(--primary-xlight)";
                }}
                onMouseLeave={e => {
                  if (!location.pathname.startsWith("/settings")) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Settings
                  className="w-[18px] h-[18px] flex-shrink-0"
                  style={{ color: location.pathname.startsWith("/settings") ? "var(--primary)" : "var(--hint)" }}
                />
                {!isCollapsed && <span className="text-xs font-semibold">Settings</span>}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Profile / Logout Footer */}
        {admin && (
          <div
            className="flex items-center flex-shrink-0"
            style={{
              padding: isCollapsed ? "16px 8px" : "16px 20px",
              borderTop: "1px solid var(--border)",
              justifyContent: isCollapsed ? "center" : "space-between",
              width: "100%"
            }}
          >
            <div
              className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "cursor-pointer" : ""}`}
              onClick={() => isCollapsed && setShowLogoutModal(true)}
              title={isCollapsed ? "Logout" : undefined}
            >
              <div className="relative flex-shrink-0">
                <Avatar name={admin.name} image={admin.profileImage} size={36} />
                <span
                  className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
                  style={{ backgroundColor: "var(--teal)" }}
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate leading-tight" style={{ color: "var(--text)" }}>
                    {admin.name}
                  </span>
                  <span className="text-[10px] font-medium mt-0.5" style={{ color: "var(--hint)" }}>
                    Administrator
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="p-1.5 rounded-lg text-[#A8A8C0] hover:text-[#EC4899] hover:bg-[#FCE7F3]/40 border-none bg-transparent cursor-pointer transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onConfirm={logout}
        onCancel={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        message="Are you sure you want to sign out of the Aura Booking administration panel?"
        confirmText="Logout"
        danger={true}
      />
    </>
  );
};

export default Sidebar;
