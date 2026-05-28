import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, ChevronDown, LogOut, Settings,
  Clock, CheckCircle2, XCircle, Ban, BellOff,
  Paintbrush, Sun, Moon, Plus
} from "lucide-react";
import {
  LayoutDashboard, CalendarCheck, Sparkles,
  Tag, Users
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import { useCustomizer } from "../../context/CustomizerContext";
import ConfirmModal from "../ui/ConfirmModal";
import Avatar from "../ui/Avatar";
import api from "../../api/axios";

const navItems = [
  { path: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { path: "/appointments",  label: "Appointments",  icon: CalendarCheck },
  { path: "/services",      label: "Services",      icon: Sparkles },
  { path: "/categories",    label: "Categories",    icon: Tag },
  { path: "/users",         label: "Users",         icon: Users },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/settings",      label: "Settings",      icon: Settings },
];

export const TopNavBar = ({ onOpenCustomizer }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const { addToast } = useToast();
  const { theme, setTheme } = useCustomizer();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const bellRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBellDropdown(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileDropdown(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleNotifClick = async (notif) => {
    setShowBellDropdown(false);
    try {
      if (!notif.isRead) await api.put(`/notifications/read/${notif._id}`);
      fetchNotifications();
      navigate(notif.appointment ? `/appointments/${notif.appointment}` : "/notifications");
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      addToast("All marked as read.", "success");
      fetchNotifications();
    } catch { addToast("Failed.", "error"); }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const getUserInitials = () => {
    if (!admin?.name) return "AD";
    const parts = admin.name.split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : admin.name.slice(0, 2).toUpperCase();
  };

  const topbarStyle = {
    backgroundColor: "var(--topbar-bg)",
    borderBottom: "1px solid var(--border)",
    transition: "background-color 0.25s ease"
  };

  const dropdownStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-hover)"
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div
        className="w-full flex-shrink-0 flex flex-col"
        style={topbarStyle}
      >
        {/* Row 1: Logo + Right Controls */}
        <div className="flex items-center justify-between px-6 h-14 border-b" style={{ borderColor: "var(--border)" }}>
          {/* Logo */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 flex-shrink-0 cursor-pointer"
          >
            <img src="/Logo.png" alt="Aura Admin" className="h-8 object-contain" />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            {/* New Booking */}
            <button
              onClick={() => navigate("/appointments")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: "var(--primary)", color: "#fff" }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Booking</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--border-light)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4" style={{ color: "#F59E0B" }} />
                : <Moon className="w-4 h-4" />
              }
            </button>

            {/* Customizer */}
            <button
              onClick={onOpenCustomizer}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--border-light)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <Paintbrush className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setShowBellDropdown(!showBellDropdown)}
                className="w-8 h-8 rounded-lg flex items-center justify-center relative"
                style={{ color: "var(--muted)" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--border-light)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showBellDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.15 } }}
                    className="absolute right-0 mt-2 w-72 rounded-xl z-50 overflow-hidden flex flex-col max-h-[340px]"
                    style={dropdownStyle}
                  >
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
                      <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[10px] font-bold" style={{ color: "var(--primary)" }}>Mark all read</button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                          <BellOff className="w-7 h-7" style={{ color: "var(--hint)" }} />
                          <span className="text-xs" style={{ color: "var(--muted)" }}>All caught up!</span>
                        </div>
                      ) : notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotifClick(notif)}
                          className="p-3 flex items-start gap-2.5 cursor-pointer"
                          style={{ borderBottom: "1px solid var(--border-light)", backgroundColor: !notif.isRead ? "var(--primary-xlight)" : "transparent" }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = !notif.isRead ? "var(--primary-xlight)" : "transparent"}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--primary-light)" }}>
                            <Bell className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold block truncate" style={{ color: "var(--text)" }}>{notif.title}</span>
                            <span className="text-[10px] leading-snug line-clamp-2" style={{ color: "var(--muted)" }}>{notif.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      onClick={() => { setShowBellDropdown(false); navigate("/notifications"); }}
                      className="p-2.5 text-center text-[11px] font-bold cursor-pointer"
                      style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--primary)" }}
                    >
                      View all notifications
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            {admin && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center p-0.5 rounded-full"
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--border-light)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <Avatar name={admin.name} image={admin.profileImage} size={32} className="border border-primary" />
                </button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.15 } }}
                      className="absolute right-0 mt-2 w-48 rounded-xl z-50 overflow-hidden flex flex-col py-1.5"
                      style={dropdownStyle}
                    >
                      <div className="px-4 py-2.5 mb-1" style={{ borderBottom: "1px solid var(--border)" }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--hint)" }}>Signed in as</p>
                        <p className="text-xs font-bold truncate mt-0.5" style={{ color: "var(--text)" }}>{admin.email}</p>
                      </div>
                      {[
                        { label: "Settings", icon: Settings, path: "/settings" }
                      ].map(({ label, icon: Icon, path }) => (
                        <button
                          key={label}
                          onClick={() => { setShowProfileDropdown(false); navigate(path); }}
                          className="w-full px-4 py-2 flex items-center gap-2 text-xs font-semibold text-left"
                          style={{ color: "var(--muted)" }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--bg)"; e.currentTarget.style.color = "var(--primary)"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{label}</span>
                        </button>
                      ))}
                      <div style={{ height: "1px", backgroundColor: "var(--border)", margin: "4px 0" }} />
                      <button
                        onClick={() => { setShowProfileDropdown(false); setShowLogoutModal(true); }}
                        className="w-full px-4 py-2 flex items-center gap-2 text-xs font-bold text-left"
                        style={{ color: "var(--primary-dark)" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--primary-light)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Horizontal Nav Links */}
        <div
          className="flex items-center gap-1 px-6 overflow-x-auto"
          style={{ height: "44px", scrollbarWidth: "none" }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0"
                style={{
                  backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--muted)"
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--primary-xlight)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
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

export default TopNavBar;
