import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Power,
  Trash2,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  User as UserIcon,
  Cake,
  Eye,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/ui/StatusBadge";
import Avatar from "../components/ui/Avatar";
import ConfirmModal from "../components/ui/ConfirmModal";
import DataTable from "../components/ui/DataTable";
import PageLoader from "../components/ui/PageLoader";
import api from "../api/axios";

export const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { admin: currentAdmin } = useAuth();

  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Booking History
  const [historyFilter, setHistoryFilter] = useState("All");

  // Modal actions
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUserDetail = useCallback(async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      if (res.data?.success) {
        setUser(res.data.data.user);
        setAppointments(res.data.data.appointments || []);
      } else {
        addToast("User not found.", "error");
        navigate("/users");
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to load user profile.", "error");
      navigate("/users");
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  const handleRoleToggle = async () => {
    if (!user) return;
    if (user._id === currentAdmin?._id) {
      addToast("You cannot adjust your own credentials.", "warning");
      return;
    }
    const nextRole = user.role === "admin" ? "user" : "admin";
    setActionLoading(true);
    setShowRoleModal(false);

    try {
      addToast("Adjusting system credentials...", "info");
      const res = await api.put(`/admin/users/role/${user._id}`, { role: nextRole });
      if (res.data?.success) {
        addToast(`User role updated to '${nextRole}' successfully.`, "success");
        fetchUserDetail();
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Error adjusting role.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;
    if (user._id === currentAdmin?._id) {
      addToast("You cannot deactivate your own account.", "warning");
      return;
    }
    const nextStatus = !user.isActive;
    setActionLoading(true);
    setShowStatusModal(false);

    try {
      addToast("Updating account active state...", "info");
      const res = await api.put(`/admin/users/toggle-status/${user._id}`);
      if (res.data?.success) {
        addToast(`User account successfully ${nextStatus ? "activated" : "deactivated"}.`, "success");
        fetchUserDetail();
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Error toggling status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (user._id === currentAdmin?._id) {
      addToast("You cannot delete your own account.", "warning");
      return;
    }
    setActionLoading(true);
    setShowDeleteModal(false);

    try {
      addToast("Purging user profile data...", "info");
      const res = await api.delete(`/admin/users/${user._id}`);
      if (res.data?.success) {
        addToast("User account permanently purged.", "success");
        navigate("/users");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Error purging account.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Computations for User booking stats
  const bookingStats = useMemo(() => {
    const stats = { Total: appointments.length, Approved: 0, Pending: 0 };
    appointments.forEach((a) => {
      if (a.status === "Approved") stats.Approved++;
      if (a.status === "Pending") stats.Pending++;
    });
    return stats;
  }, [appointments]);

  // Filters mapping
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      return historyFilter === "All" || appt.status === historyFilter;
    });
  }, [appointments, historyFilter]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Compact History Table Columns
  const columns = [
    {
      label: "Order #",
      render: (row) => (
        <span className="font-semibold text-[#F472B6] text-xs font-mono select-all">
          {row.orderNumber ? `#${row.orderNumber.split("-").pop()}` : `#SPA-${row._id.slice(-4).toUpperCase()}`}
        </span>
      )
    },
    {
      label: "Service Requested",
      render: (row) => (
        <span className="font-semibold text-[#1A1A2E] text-xs truncate max-w-[130px] block">
          {row.service?.name || "Therapeutic Massage"}
        </span>
      )
    },
    {
      label: "Tier",
      render: (row) => {
        let typeColors = "bg-[#F5F5F5] text-[#6B6B8A]";
        if (row.serviceType === "VIP") typeColors = "bg-[#FCE7F3] text-[#F472B6]";
        else if (row.serviceType === "VVIP") typeColors = "bg-[#FEECEC] text-[#EC4899]";
        return (
          <span className={`px-2 py-0.5 rounded-pill text-[9px] font-bold ${typeColors}`}>
            {row.serviceType || "Normal"}
          </span>
        );
      }
    },
    {
      label: "Date",
      render: (row) => (
        <span className="text-[11px] text-[#6B6B8A] whitespace-nowrap">
          {formatDate(row.appointmentDate)}
        </span>
      )
    },
    {
      label: "Price",
      render: (row) => (
        <span className="font-bold text-[#F472B6] text-xs">
          ₹{(row.price || row.service?.finalPrice || 0).toLocaleString()}
        </span>
      )
    },
    {
      label: "Status",
      render: (row) => <StatusBadge status={row.status} size="sm" />
    },
    {
      label: "View",
      className: "text-right",
      render: (row) => (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/appointments/${row._id}`)}
          className="p-1 text-[#A8A8C0] hover:text-[#F472B6] hover:bg-[#FDF2F8] border border-[#F9D0E8] rounded transition-colors"
          title="Open Booking Spec"
        >
          <Eye className="w-3.5 h-3.5 text-[#F472B6]" />
        </motion.button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 select-none font-sans">
      {/* Back button row */}
      <button
        onClick={() => navigate("/users")}
        className="flex items-center gap-2 text-xs font-bold text-[#F472B6] hover:text-[#EC4899] transition-colors w-max border-none bg-transparent"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Users</span>
      </button>

      {/* Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (User Profile Profile - 38% width equivalent) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Card: Profile Banner */}
          <div className="bg-white border border-[#F9D0E8] rounded-card overflow-hidden shadow-card">
            {/* Gradient Header */}
            <div className="bg-gradient-to-br from-[#F472B6] to-[#EC4899] p-8 text-center flex flex-col items-center gap-3 relative select-none">
              <Avatar name={user.name} image={user.profileImage} size={80} className="border-4 border-white shadow-md" />
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold text-white leading-tight">{user.name}</h3>
                <span
                  className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold text-white mt-1.5 uppercase select-none"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  {user.role} Account
                </span>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 border-b border-[#F9D0E8] divide-x divide-[#F9D0E8] text-center select-none bg-[#FDF2F8]/30">
              <div className="py-3.5 flex flex-col">
                <span className="text-lg font-bold text-[#1A1A2E]">{bookingStats.Total}</span>
                <span className="text-[9px] text-[#A8A8C0] uppercase font-bold tracking-wider">Bookings</span>
              </div>
              <div className="py-3.5 flex flex-col">
                <span className="text-lg font-bold text-[#3FA8A4]">{bookingStats.Approved}</span>
                <span className="text-[9px] text-[#A8A8C0] uppercase font-bold tracking-wider">Approved</span>
              </div>
              <div className="py-3.5 flex flex-col">
                <span className="text-lg font-bold text-[#F472B6]">{bookingStats.Pending}</span>
                <span className="text-[9px] text-[#A8A8C0] uppercase font-bold tracking-wider">Pending</span>
              </div>
            </div>

            {/* Details list */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-[#6B6B8A]">
                <Mail className="w-4 h-4 text-[#F472B6] flex-shrink-0" />
                <span className="truncate">{user.email || "No email registered"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#6B6B8A]">
                <Phone className="w-4 h-4 text-[#F472B6] flex-shrink-0" />
                <span>{user.mobileNumber || "N/A"}</span>
              </div>
              
              <div className="h-px bg-[#F0F0F5] my-1" />

              <div className="flex justify-between items-center text-sm">
                <span className="text-[#A8A8C0] font-semibold text-xs uppercase flex items-center gap-1.5 select-none">
                  <Cake className="w-3.5 h-3.5 text-[#F472B6]" /> Age
                </span>
                <span className="font-bold text-[#1A1A2E]">{user.age ? `${user.age} Years` : "N/A"}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-[#A8A8C0] font-semibold text-xs uppercase flex items-center gap-1.5 select-none">
                  <UserIcon className="w-3.5 h-3.5 text-[#F472B6]" /> Gender
                </span>
                <span className="font-bold text-[#1A1A2E] capitalize">{user.gender || "Other"}</span>
              </div>

              <div className="flex justify-between items-start text-sm">
                <span className="text-[#A8A8C0] font-semibold text-xs uppercase flex items-center gap-1.5 select-none mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F472B6]" /> Location
                </span>
                <div className="flex flex-col items-end text-right font-bold text-[#1A1A2E]">
                  <span>{user.state || "Gujarat"}</span>
                  <span className="text-xs text-[#A8A8C0] font-semibold mt-0.5">{user.country || "India"}</span>
                </div>
              </div>
            </div>

            {/* Profile administrative actions block */}
            <div className="p-4 border-t border-[#F9D0E8] bg-[#FDF2F8]/20 flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                disabled={user._id === currentAdmin?._id}
                onClick={() => setShowRoleModal(true)}
                className="w-full py-2.5 outline-pink text-[#F472B6] border border-[#F9D0E8] hover:bg-[#FDF2F8] text-xs font-bold rounded-btn flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{user.role === "admin" ? "Demote to User" : "Promote to Admin"}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                disabled={user._id === currentAdmin?._id}
                onClick={() => setShowStatusModal(true)}
                className={`w-full py-2.5 text-xs font-bold rounded-btn flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  user.isActive
                    ? "bg-[#FCE7F3]/55 text-[#EC4899] hover:bg-[#FCE7F3]"
                    : "bg-[#E0F5F5]/75 text-[#3FA8A4] hover:bg-[#E0F5F5]"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{user.isActive ? "Deactivate Account" : "Activate Account"}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                disabled={user._id === currentAdmin?._id}
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 border border-[#EC4899] text-[#EC4899] hover:bg-[#FCE7F3]/30 text-xs font-bold rounded-btn flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete User Account</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column (Appointments History - 62% width equivalent) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Booking History Table */}
          <div className="bg-white border border-[#F9D0E8] rounded-card p-6 shadow-card flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F0F0F5] pb-3 select-none">
              <h3 className="text-base font-semibold text-[#1A1A2E] flex items-center gap-2">
                <span>Appointment History</span>
                <span className="px-2 py-0.5 bg-[#FCE7F3] text-[#F472B6] text-xs font-bold rounded-full">
                  {appointments.length}
                </span>
              </h3>

              {/* Mini Status Tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {["All", "Pending", "Approved", "Rejected"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHistoryFilter(tab)}
                    className={`px-3 py-1 rounded-pill text-[11px] font-semibold transition-all border-none ${
                      historyFilter === tab
                        ? "bg-[#F472B6] text-white"
                        : "bg-[#FCE7F3]/30 text-[#F472B6] hover:bg-[#FCE7F3]/70"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table component */}
            <DataTable
              columns={columns}
              rows={filteredAppointments}
              onRowClick={(row) => navigate(`/appointments/${row._id}`)}
            />
          </div>

          {/* Registration Face Screenshot section (if exists) */}
          {user.faceScreenshot && (
            <div className="bg-white border border-[#F9D0E8] rounded-card p-6 shadow-card flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-[#1A1A2E] border-b border-[#F0F0F5] pb-2.5">
                Registration Verification Photo
              </h3>
              <div className="flex flex-col md:flex-row gap-4 items-center md:items-start select-none">
                <img
                  src={user.faceScreenshot}
                  alt="Registration Photo"
                  className="w-32 h-32 rounded-[12px] object-cover border border-[#F9D0E8]"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="flex flex-col gap-1 text-center md:text-left">
                  <span className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5 justify-center md:justify-start">
                    <CheckCircle2 className="w-4 h-4 text-[#67C4C0]" /> Face Verification Active
                  </span>
                  <p className="text-[11px] text-[#6B6B8A] mt-1 max-w-sm leading-normal">
                    This photo was uploaded by the client during initial registration for authentication verification purposes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Role Modal */}
      <ConfirmModal
        isOpen={showRoleModal}
        onConfirm={handleRoleToggle}
        onCancel={() => setShowRoleModal(false)}
        title="Adjust User Authorization Tiers?"
        message={`Are you sure you want to change "${user.name}"'s access classification to ${
          user.role === "admin" ? "'user' (Client)" : "'admin' (Administrator)"
        }?`}
        confirmText="Confirm"
        danger={false}
      />

      {/* Confirmation Status Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onConfirm={handleStatusToggle}
        onCancel={() => setShowStatusModal(false)}
        title={user.isActive ? "Deactivate Account?" : "Activate Account?"}
        message={`This will ${
          user.isActive ? "deactivate" : "activate"
        } account credentials for "${user.name}". Users with inactive states are immediately blocked from logging in.`}
        confirmText="Confirm"
        danger={user.isActive}
      />

      {/* Confirmation Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteUser}
        onCancel={() => setShowDeleteModal(false)}
        title="Permanently Purge Account?"
        message={`Are you sure you want to completely delete "${user.name}"'s system details? This will permanently erase profile fields, locations, and ALL their appointment schedules from the database.`}
        confirmText="Purge"
        danger={true}
      />
    </div>
  );
};

export default UserDetail;
