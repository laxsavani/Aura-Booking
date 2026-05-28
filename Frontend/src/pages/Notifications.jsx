import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  CheckCheck,
  Calendar,
  X
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import api from "../api/axios";

export const Notifications = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tabs Filter (All, Unread, Read)
  const [selectedTab, setSelectedTab] = useState("All");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to retrieve system alerts.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Actions
  const handleMarkOneRead = async (id, e) => {
    if (e) e.stopPropagation();
    
    // Optimistic Update
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const res = await api.put(`/notifications/read/${id}`);
      if (!res.data?.success) {
        fetchNotifications();
      }
    } catch (err) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    
    // Optimistic Update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      addToast("Marking all alerts as read...", "info");
      const res = await api.put("/notifications/read-all");
      if (res.data?.success) {
        addToast("All alerts marked as read.", "success");
        fetchNotifications();
      } else {
        fetchNotifications();
        addToast("Failed to update alerts status.", "error");
      }
    } catch (err) {
      fetchNotifications();
    }
  };

  const handleDeleteOne = async (id, e) => {
    e.stopPropagation();
    
    // Optimistic Update
    const target = notifications.find(n => n._id === id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (target && !target.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data?.success) {
        addToast("Notification dismissed.", "success");
        fetchNotifications();
      } else {
        fetchNotifications();
        addToast("Failed to dismiss alert.", "error");
      }
    } catch (err) {
      fetchNotifications();
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    // Optimistic Update
    setNotifications([]);
    setUnreadCount(0);

    try {
      addToast("Clearing alert logs...", "info");
      const res = await api.delete("/notifications/all");
      if (res.data?.success) {
        addToast("Notification logs successfully cleared.", "success");
        fetchNotifications();
      } else {
        fetchNotifications();
        addToast("Failed to clear notification logs.", "error");
      }
    } catch (err) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await handleMarkOneRead(notif._id);
      }
      if (notif.appointment) {
        navigate(`/appointments/${notif.appointment}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (selectedTab === "Unread") return !n.isRead;
      if (selectedTab === "Read") return n.isRead;
      return true;
    });
  }, [notifications, selectedTab]);

  const tabCounts = useMemo(() => {
    const counts = { All: notifications.length, Unread: 0, Read: 0 };
    notifications.forEach((n) => {
      if (n.isRead) counts.Read++;
      else counts.Unread++;
    });
    return counts;
  }, [notifications]);

  // Dynamic Icon Selection
  const getAlertStyle = (title = "") => {
    const t = title.toLowerCase();
    if (t.includes("book") || t.includes("schedule") || t.includes("priority")) {
      return { icon: Clock, bg: "bg-[#FDF2F8]", color: "text-[#F472B6]" };
    }
    if (t.includes("approve") || t.includes("success")) {
      return { icon: CheckCircle, bg: "bg-[#E0F5F5]", color: "text-[#67C4C0]" };
    }
    if (t.includes("reject") || t.includes("decline")) {
      return { icon: XCircle, bg: "bg-[#FCE7F3]", color: "text-[#EC4899]" };
    }
    if (t.includes("cancel")) {
      return { icon: Ban, bg: "bg-[#F5F5F5]", color: "text-[#6B6B8A]" };
    }
    return { icon: Bell, bg: "bg-[#FCE7F3]", color: "text-[#F472B6]" };
  };

  // Nice time-ago formatting
  const formatTimeAgo = (dateStr) => {
    try {
      const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return `${interval}y ago`;
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return `${interval}mo ago`;
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return `${interval}d ago`;
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return `${interval}h ago`;
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return `${interval}m ago`;
      return "just now";
    } catch {
      return "some time ago";
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F9D0E8] pb-4 select-none">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-display font-bold text-[#1A1A2E]">
            Notifications Center
          </h2>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 bg-[#F472B6] text-white text-[11px] font-bold rounded-full pulse-dot-pink">
              {unreadCount} Unread
            </span>
          )}
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            disabled={unreadCount === 0}
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 border border-[#F9D0E8] text-[#F472B6] hover:bg-[#FDF2F8] text-xs font-bold rounded-btn flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-none bg-transparent"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            disabled={notifications.length === 0}
            onClick={handleDeleteAll}
            className="px-3.5 py-2 border border-[#EC4899] text-[#EC4899] hover:bg-[#FCE7F3]/40 text-xs font-bold rounded-btn flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-none bg-transparent"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All logs</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-2 border-b border-[#F0F0F5] pb-1 select-none">
        {["All", "Unread", "Read"].map((tab) => {
          const isTabActive = selectedTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 border-b-2 font-bold text-xs transition-all duration-150 border-none cursor-pointer flex items-center gap-2 ${
                isTabActive
                  ? "border-[#F472B6] text-[#F472B6] bg-[#FDF2F8]/30"
                  : "border-transparent text-[#A8A8C0] hover:text-[#F472B6]"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  isTabActive ? "bg-[#FCE7F3] text-[#F472B6]" : "bg-[#F5F5F5] text-[#6B6B8A]"
                }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3 min-h-[300px]">
        {loading ? (
          <div className="bg-white border border-[#F9D0E8] rounded-card p-6 shadow-card flex flex-col gap-4">
            <LoadingSkeleton type="row" count={4} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            subtitle={
              selectedTab === "Unread"
                ? "No unread alerts in catalog logs."
                : selectedTab === "Read"
                ? "No read alerts in catalog logs."
                : "You don't have any notifications yet."
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif) => {
                const isUnread = !notif.isRead;
                const style = getAlertStyle(notif.title);
                const Icon = style.icon;

                return (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, height: 0, opacity: 0, overflow: "hidden", transition: { duration: 0.2 } }}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-4 p-4 md:p-5 rounded-card border shadow-card cursor-pointer group relative overflow-hidden transition-all duration-150 ${
                      isUnread
                        ? "bg-white border-[#F9D0E8] border-l-4 border-l-[#F472B6]"
                        : "bg-[#FDF2F8]/30 border-[#F0F0F5]"
                    }`}
                  >
                    {/* Pulsing indicator background if unread */}
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F472B6]" />
                    )}

                    {/* Icon Circle */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                      <Icon className={`w-5 h-5 ${style.color}`} />
                    </div>

                    {/* Center Details */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1 pr-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isUnread ? "font-bold text-[#1A1A2E]" : "font-semibold text-[#6B6B8A]"}`}>
                          {notif.title}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F472B6] pulse-dot-pink" />
                        )}
                      </div>
                      <p className="text-xs text-[#6B6B8A] leading-relaxed">
                        {notif.message}
                      </p>
                      
                      {/* Meta information tags */}
                      {notif.appointment && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px] text-[#A8A8C0] font-semibold uppercase tracking-wider">
                          <span className="text-[#F472B6] font-bold font-mono">
                            {notif.message.includes("SPA-") ? "" : `#SPA-${notif.appointment.slice(-4).toUpperCase()}`}
                          </span>
                          <span>·</span>
                          <span>Client Request Audit</span>
                        </div>
                      )}
                    </div>

                    {/* Right side Metadata & X dismiss button */}
                    <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0 relative select-none">
                      <span className="text-[10px] text-[#A8A8C0] font-bold">
                        {formatTimeAgo(notif.createdAt)}
                      </span>

                      {/* X Clear action button (visible on card hover) */}
                      <button
                        onClick={(e) => handleDeleteOne(notif._id, e)}
                        className="p-1 rounded-full text-[#A8A8C0] hover:text-[#EC4899] hover:bg-[#FCE7F3] border-none md:opacity-0 group-hover:opacity-100 transition-all duration-150 absolute bottom-0 right-0"
                        title="Dismiss alert"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
