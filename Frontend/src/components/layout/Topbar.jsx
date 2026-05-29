import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, Menu, ChevronDown, LogOut, Settings,
  Clock, CheckCircle2, XCircle, Ban, BellOff,
  Search, Paintbrush, Sun, Moon, Plus
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import { useCustomizer } from "../../context/CustomizerContext";
import ConfirmModal from "../ui/ConfirmModal";
import Avatar from "../ui/Avatar";
import api from "../../api/axios";

export const Topbar = ({ toggleSidebar, onOpenCustomizer }) => {
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
  const [searchQuery, setSearchQuery] = useState("");

  const bellRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/appointments/")) return "Appointment Detail";
    if (path.startsWith("/appointments")) return "Appointments";
    if (path.startsWith("/services")) return "Services";
    if (path.startsWith("/categories")) return "Categories";
    if (path.startsWith("/users/")) return "User Profile";
    if (path.startsWith("/users")) return "Users";
    if (path.startsWith("/notifications")) return "Notifications";
    if (path.startsWith("/settings")) return "Settings";
    return "Dashboard";
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Aura > Dashboard";
    if (path.startsWith("/appointments/")) return "Aura > Appointments > Detail";
    if (path.startsWith("/appointments")) return "Aura > Appointments";
    if (path.startsWith("/services")) return "Aura > Services";
    if (path.startsWith("/categories")) return "Aura > Categories";
    if (path.startsWith("/users/")) return "Aura > Users > Profile";
    if (path.startsWith("/users")) return "Aura > Users";
    if (path.startsWith("/notifications")) return "Aura > Notifications";
    if (path.startsWith("/settings")) return "Aura > Settings";
    return "Aura > Dashboard";
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBellDropdown(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileDropdown(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleNotificationClick = async (notif) => {
    setShowBellDropdown(false);
    try {
      if (!notif.isRead) {
        await api.put(`/notifications/read/${notif._id}`);
        fetchNotifications();
      }
      navigate(notif.appointment ? `/appointments/${notif.appointment}` : "/notifications");
    } catch (err) {
      console.error("Failed to read notification", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put("/notifications/read-all");
      if (res.data?.success) {
        addToast("All notifications marked as read.", "success");
        fetchNotifications();
      }
    } catch (err) {
      addToast("Failed to mark all as read.", "error");
    }
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
    color: "var(--text)",
    transition: "background-color 0.25s ease"
  };

  const dropdownStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-hover)"
  };

  const mutedColor = { color: "var(--muted)" };
  const hintColor = { color: "var(--hint)" };

  return (
    <>
      <div
        className="h-16 w-full sticky top-0 z-30 flex items-center justify-between px-6 select-none"
        style={topbarStyle}
      >
        {/* Left: Mobile toggle + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--muted)" }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-base font-bold leading-tight" style={{ color: "var(--text)" }}>
              {getPageTitle()}
            </h1>
            <span className="text-[10px] font-medium tracking-wide hidden sm:inline" style={hintColor}>
              {getBreadcrumb()}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--muted)", backgroundColor: "transparent" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--border-light)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            title="Toggle Theme"
          >
            {theme === "dark"
              ? <Sun className="w-4.5 h-4.5" style={{ color: "#F59E0B" }} />
              : <Moon className="w-4 h-4" />
            }
          </button>

          {/* Customizer */}
          <button
            onClick={onOpenCustomizer}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--border-light)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            title="Customizer"
          >
            <Paintbrush className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowBellDropdown(!showBellDropdown)}
              className="w-9 h-9 rounded-lg flex items-center justify-center relative transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--border-light)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
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
                  className="absolute right-0 mt-2 w-80 rounded-xl z-50 overflow-hidden flex flex-col max-h-[380px]"
                  style={dropdownStyle}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg)" }}
                  >
                    <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold transition-colors"
                        style={{ color: "var(--primary)" }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center gap-2">
                        <BellOff className="w-8 h-8" style={hintColor} />
                        <span className="text-xs font-medium" style={mutedColor}>All caught up!</span>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => {
                        let icon = <Clock className="w-4 h-4" style={{ color: "var(--primary)" }} />;
                        let iconBgColor = "var(--primary-xlight)";
                        const titleLower = (notif.title || "").toLowerCase();
                        if (titleLower.includes("approve")) {
                          icon = <CheckCircle2 className="w-4 h-4" style={{ color: "var(--teal)" }} />;
                          iconBgColor = "var(--teal-light)";
                        } else if (titleLower.includes("reject")) {
                          icon = <XCircle className="w-4 h-4" style={{ color: "var(--primary-dark)" }} />;
                          iconBgColor = "var(--primary-light)";
                        } else if (titleLower.includes("cancel")) {
                          icon = <Ban className="w-4 h-4" style={mutedColor} />;
                          iconBgColor = "var(--border-light)";
                        }
                        return (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className="p-3.5 flex items-start gap-3 cursor-pointer transition-colors duration-150"
                            style={{
                              borderBottom: "1px solid var(--border-light)",
                              backgroundColor: !notif.isRead ? "var(--primary-xlight)" : "transparent"
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = !notif.isRead ? "var(--primary-xlight)" : "transparent"}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: iconBgColor }}
                            >
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              <span className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>
                                {notif.title}
                              </span>
                              <span className="text-[10px] leading-normal line-clamp-2" style={mutedColor}>
                                {notif.body || notif.message}
                              </span>
                            </div>
                            {!notif.isRead && (
                              <span
                                className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 animate-pulse"
                                style={{ backgroundColor: "var(--primary)" }}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div
                    onClick={() => { setShowBellDropdown(false); navigate("/notifications"); }}
                    className="p-3 text-center text-[11px] font-bold cursor-pointer transition-colors"
                    style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--primary)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--primary-dark)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--primary)"}
                  >
                    View all notifications
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Avatar */}
          {admin && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center p-0.5 rounded-full transition-colors"
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
                    className="absolute right-0 mt-2 w-52 rounded-xl z-50 overflow-hidden flex flex-col py-1.5"
                    style={dropdownStyle}
                  >
                    <div
                      className="px-4 py-3 mb-1"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={hintColor}>
                        Signed in as
                      </p>
                      <p className="text-xs font-bold truncate mt-0.5" style={{ color: "var(--text)" }}>
                        {admin.email}
                      </p>
                    </div>

                    {[
                      { label: "Notifications", icon: Bell, path: "/notifications" },
                      { label: "Settings", icon: Settings, path: "/settings" }
                    ].map(({ label, icon: Icon, path }) => (
                      <button
                        key={label}
                        onClick={() => { setShowProfileDropdown(false); navigate(path); }}
                        className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs font-semibold text-left transition-colors"
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
                      className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs font-bold text-left transition-colors"
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

export default Topbar;
