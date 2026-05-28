import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  RefreshCw,
  Plus,
  Tag,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import DataTable from "../components/ui/DataTable";
import ConfirmModal from "../components/ui/ConfirmModal";
import Avatar from "../components/ui/Avatar";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import api from "../api/axios";

// Recharts components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingTableLoading, setPendingTableLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  // Modal and Action states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dynamic Chart States
  const [weeklyOverviewData, setWeeklyOverviewData] = useState([]);
  const [serviceDistributionData, setServiceDistributionData] = useState([]);
  const [totalServiceBookings, setTotalServiceBookings] = useState(0);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/dashboard");
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch dashboard statistics.", "error");
    }
  }, [addToast]);

  const fetchChartData = useCallback(async () => {
    try {
      const res = await api.get("/appointments/admin/all");
      if (res.data?.success) {
        const allAppts = res.data.data.appointments || [];

        // 1. Group last 7 days or group by day of week
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayGroups = {
          Mon: { name: "Mon", Approved: 0, Pending: 0, Rejected: 0 },
          Tue: { name: "Tue", Approved: 0, Pending: 0, Rejected: 0 },
          Wed: { name: "Wed", Approved: 0, Pending: 0, Rejected: 0 },
          Thu: { name: "Thu", Approved: 0, Pending: 0, Rejected: 0 },
          Fri: { name: "Fri", Approved: 0, Pending: 0, Rejected: 0 },
          Sat: { name: "Sat", Approved: 0, Pending: 0, Rejected: 0 },
          Sun: { name: "Sun", Approved: 0, Pending: 0, Rejected: 0 }
        };

        allAppts.forEach(appt => {
          if (!appt.appointmentDate) return;
          const date = new Date(appt.appointmentDate);
          const dayName = weekdays[date.getDay()];
          const status = appt.status;
          
          if (dayGroups[dayName] && (status === "Approved" || status === "Pending" || status === "Rejected")) {
            dayGroups[dayName][status]++;
          }
        });

        const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => dayGroups[day]);
        setWeeklyOverviewData(orderedDays);

        // 2. Service Distribution Grouping by serviceType
        const serviceGroups = {
          Normal: 0,
          High: 0,
          VIP: 0,
          VVIP: 0
        };

        allAppts.forEach(appt => {
          const type = appt.serviceType || "Normal";
          if (serviceGroups[type] !== undefined) {
            serviceGroups[type]++;
          } else {
            serviceGroups.Normal++;
          }
        });

        const dist = [
          { name: "Normal", value: serviceGroups.Normal, color: "#E0F5F5" },
          { name: "High", value: serviceGroups.High, color: "#67C4C0" },
          { name: "VIP", value: serviceGroups.VIP, color: "#F472B6" },
          { name: "VVIP", value: serviceGroups.VVIP, color: "#EC4899" }
        ];

        setServiceDistributionData(dist);
        setTotalServiceBookings(allAppts.length);
      }
    } catch (err) {
      console.error("Failed to compile dynamic chart aggregates", err);
    }
  }, []);

  const fetchPendingAppointments = useCallback(async () => {
    setPendingTableLoading(true);
    try {
      const res = await api.get("/appointments/admin/all?status=Pending");
      if (res.data?.success) {
        // Show max 8 pending approvals as per ui.md
        setPendingAppointments(res.data.data.appointments.slice(0, 8) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPendingTableLoading(false);
    }
  }, []);

  const fetchRecentUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/admin/users");
      if (res.data?.success) {
        // Show last 5 users as per ui.md
        setRecentUsers(res.data.data.users.slice(0, 5) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const initData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardStats(),
      fetchChartData(),
      fetchPendingAppointments(),
      fetchRecentUsers()
    ]);
    setLoading(false);
  }, [fetchDashboardStats, fetchChartData, fetchPendingAppointments, fetchRecentUsers]);

  useEffect(() => {
    initData();
  }, [initData]);

  // Actions
  const handleApprove = async (id, e) => {
    e.stopPropagation(); // Prevent row click navigation
    
    // Optimistic Update
    const prevAppts = [...pendingAppointments];
    setPendingAppointments(prev => prev.filter(a => a._id !== id));
    
    try {
      addToast("Approving appointment...", "info");
      const res = await api.put(`/appointments/admin/${id}/status`, { status: "Approved" });
      if (res.data?.success) {
        addToast("Appointment approved successfully.", "success");
        fetchDashboardStats();
      } else {
        setPendingAppointments(prevAppts);
        addToast("Failed to approve appointment.", "error");
      }
    } catch (err) {
      setPendingAppointments(prevAppts);
      addToast(err.response?.data?.message || "Error updating appointment status.", "error");
    }
  };

  const handleOpenRejectModal = (appt, e) => {
    e.stopPropagation(); // Prevent row click
    setSelectedAppt(appt);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedAppt) return;
    const id = selectedAppt._id;
    
    // Optimistic Update
    const prevAppts = [...pendingAppointments];
    setPendingAppointments(prev => prev.filter(a => a._id !== id));
    setShowRejectModal(false);
    
    try {
      addToast("Rejecting appointment...", "info");
      const res = await api.put(`/appointments/admin/${id}/status`, { status: "Rejected" });
      if (res.data?.success) {
        addToast("Appointment rejected successfully.", "success");
        fetchDashboardStats();
      } else {
        setPendingAppointments(prevAppts);
        addToast("Failed to reject appointment.", "error");
      }
    } catch (err) {
      setPendingAppointments(prevAppts);
      addToast(err.response?.data?.message || "Error updating appointment status.", "error");
    } finally {
      setSelectedAppt(null);
    }
  };

  // Formatter for date
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Table Columns Setup
  const columns = [
    {
      label: "Order #",
      field: "orderNumber",
      render: (row) => (
        <span className="font-semibold text-primary tracking-wide select-all font-mono">
          {row.orderNumber ? `#${row.orderNumber.split("-").pop()}` : `#SPA-${row._id.slice(-4).toUpperCase()}`}
        </span>
      )
    },
    {
      label: "Client",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.fullName} size={28} />
          <span className="font-medium text-[#1A1A2E] whitespace-nowrap">{row.fullName}</span>
        </div>
      )
    },
    {
      label: "Service",
      field: "service",
      render: (row) => (
        <span className="font-medium text-[#1A1A2E] truncate block max-w-[150px]">
          {row.service?.name || "N/A"}
        </span>
      )
    },
    {
      label: "Category",
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-pill text-[11px] bg-[#E0F5F5] text-[#3FA8A4] font-semibold">
          {row.category?.name || "Therapy"}
        </span>
      )
    },
    {
      label: "Type",
      render: (row) => {
        let typeColors = "bg-[#F5F5F5] text-[#6B6B8A]";
        if (row.serviceType === "VIP") typeColors = "bg-primary-light text-primary";
        else if (row.serviceType === "VVIP") typeColors = "bg-red-50 text-red-600";
        else if (row.serviceType === "High") typeColors = "bg-[#E0F5F5] text-[#3FA8A4]";
        return (
          <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-bold ${typeColors}`}>
            {row.serviceType || "Normal"}
          </span>
        );
      }
    },
    {
      label: "Date",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-[#6B6B8A] whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5 text-[#A8A8C0]" />
          <span>{formatDate(row.appointmentDate)}</span>
        </div>
      )
    },
    {
      label: "Price",
      render: (row) => (
        <span className="font-bold text-primary whitespace-nowrap">
          ₹{(row.price || row.service?.finalPrice || 0).toLocaleString()}
        </span>
      )
    },
    {
      label: "Status",
      render: (row) => <StatusBadge status={row.status} size="sm" />
    },
    {
      label: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#67C4C0", color: "#FFFFFF" }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleApprove(row._id, e)}
            className="flex items-center gap-1 bg-[#E0F5F5] text-[#3FA8A4] border-none rounded-btn px-2.5 py-1 text-xs font-semibold select-none transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#F472B6", color: "#FFFFFF" }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleOpenRejectModal(row, e)}
            className="flex items-center gap-1 bg-[#FCE7F3] text-[#EC4899] border-none rounded-btn px-2.5 py-1 text-xs font-semibold select-none transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </motion.button>
        </div>
      )
    }
  ];

  // Helper for greeting message
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold leading-tight select-none" style={{ color: "var(--text)" }}>
            {getGreeting()}, {admin?.name || "Admin"} 👋
          </h2>
          <p className="text-sm mt-1 select-none" style={{ color: "var(--muted)" }}>
            Here's what's happening with Aura Booking today.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <span
            className="text-xs font-semibold tracking-wide px-3 py-2 rounded-full select-none"
            style={{ color: "var(--muted)", backgroundColor: "var(--primary-xlight)", border: "1px solid var(--border)" }}
          >
            {formattedDate}
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={initData}
            className="p-2 rounded-full flex items-center justify-center transition-colors"
            style={{ border: "1px solid var(--border)", color: "var(--primary)", backgroundColor: "var(--card)" }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : (
          <>
            <StatCard
              value={stats?.totalUsers || 0}
              label="Total Users"
              icon={Users}
              color="#67C4C0"
              trend="up"
              trendValue="+12%"
            />
            <StatCard
              value={stats?.totalAppointments || 0}
              label="Total Appointments"
              icon={CalendarCheck}
              color="#67C4C0"
              trend="up"
              trendValue="+8%"
            />
            <StatCard
              value={stats?.pendingAppointments || 0}
              label="Pending Approvals"
              icon={Clock}
              color="#F472B6"
              className={stats?.pendingAppointments > 0 ? "animate-pulse" : ""}
            />
            <StatCard
              value={stats?.approvedAppointments || 0}
              label="Approved Bookings"
              icon={CheckCircle}
              color="#67C4C0"
            />
            <StatCard
              value={stats?.rejectedAppointments || 0}
              label="Rejected Bookings"
              icon={XCircle}
              color="#EC4899"
            />
            <StatCard
              value={stats?.totalServices || 0}
              label="Total Catalog Services"
              icon={Sparkles}
              color="#67C4C0"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        {/* Appointments Overview Bar Chart */}
        <div className="rounded-xl p-6 flex flex-col gap-4" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div>
            <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>Appointments Overview</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Last 7 days system metrics</p>
          </div>
          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--hint)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--hint)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", borderRadius: "10px", borderColor: "var(--border)", color: "var(--text)" }}
                  labelStyle={{ fontWeight: "bold", color: "var(--text)" }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12, color: "var(--muted)" }} />
                <Bar dataKey="Approved" fill="#67C4C0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#F472B6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rejected" fill="#EC4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Type Donut Pie Chart */}
        <div className="rounded-xl p-6 flex flex-col justify-between" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div>
            <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>Service Type Bookings</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Tiered bookings share</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-60">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {serviceDistributionData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-2xl font-bold" style={{ color: "var(--text)" }}>{totalServiceBookings}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>Total</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {serviceDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs" style={{ color: "var(--muted)" }}>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold w-12" style={{ color: "var(--text)" }}>{item.name}</span>
                  <span>({item.value} bookings)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Table Container */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
            <h3 className="text-[17px] font-semibold" style={{ color: "var(--text)" }}>Pending Approvals</h3>
            {pendingAppointments.length > 0 && (
              <span className="px-2 py-0.5 bg-primary-light text-primary text-xs font-bold rounded-full">
                {pendingAppointments.length}
              </span>
            )}
          </div>
          <Link
            to="/appointments?status=Pending"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable
          columns={columns}
          rows={pendingAppointments}
          loading={pendingTableLoading}
          onRowClick={(row) => navigate(`/appointments/${row._id}`)}
        />
      </div>

      {/* Lower Registrations & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        {/* New Users Registrations */}
        <div className="rounded-xl p-6 flex flex-col gap-4" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between pb-3 select-none" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>New Users</h3>
            <Link
              to="/users"
              className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
            >
              View All Users
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {usersLoading ? (
              <LoadingSkeleton type="row" count={5} />
            ) : recentUsers.length === 0 ? (
              <div className="p-8 text-center text-xs" style={{ color: "var(--muted)" }}>No new users registered recently.</div>
            ) : (
              recentUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => navigate(`/users/${user._id}`)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-150"
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={user.name} image={user.profileImage} size={40} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{user.name}</span>
                      <span className="text-xs truncate" style={{ color: "var(--muted)" }}>{user.email || user.mobileNumber}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={user.role === "admin"
                        ? { backgroundColor: "var(--primary-light)", color: "var(--primary)" }
                        : { backgroundColor: "var(--border-light)", color: "var(--muted)" }
                      }
                    >
                      {user.role}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: "var(--hint)" }}>Joined recently</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="rounded-xl p-6 flex flex-col gap-4 select-none" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div className="pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {[
              { label: "Add Service", desc: "Create catalog items", icon: Plus, iconBg: "var(--primary-light)", iconColor: "var(--primary)", hoverBg: "var(--primary-xlight)", hoverBorder: "var(--primary)", action: () => navigate("/services", { state: { openAddDrawer: true } }) },
              { label: "Add Category", desc: "Group catalog items", icon: Tag, iconBg: "var(--teal-light)", iconColor: "var(--teal-dark)", hoverBg: "var(--teal-light)", hoverBorder: "var(--teal)", action: () => navigate("/categories", { state: { openAddModal: true } }) },
              { label: "View Pending", desc: "Approve requests", icon: Clock, iconBg: "var(--primary-xlight)", iconColor: "var(--primary)", hoverBg: "var(--primary-xlight)", hoverBorder: "var(--primary)", action: () => navigate("/appointments?status=Pending") },
              { label: "Manage Users", desc: "Tweak authorizations", icon: Users, iconBg: "var(--primary-light)", iconColor: "var(--primary)", hoverBg: "var(--primary-light)", hoverBorder: "var(--teal)", action: () => navigate("/users") }
            ].map(({ label, desc, icon: Icon, iconBg, iconColor, hoverBg, hoverBorder, action }) => (
              <motion.div
                key={label}
                whileHover={{ y: -2 }}
                onClick={action}
                className="rounded-xl p-4 cursor-pointer flex flex-col gap-3 transition-all duration-150"
                style={{ border: "1px solid var(--border)", backgroundColor: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = hoverBg; e.currentTarget.style.borderColor = hoverBorder; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: iconBg, color: iconColor }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{label}</span>
                  <span className="text-[10px] mt-0.5 leading-normal" style={{ color: "var(--muted)" }}>{desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Reject Confirm Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onConfirm={handleRejectConfirm}
        onCancel={() => {
          setShowRejectModal(false);
          setSelectedAppt(null);
        }}
        title="Reject Appointment?"
        message={`Are you sure you want to reject the appointment SPA-${selectedAppt?.orderNumber?.split("-").pop() || selectedAppt?._id?.slice(-4).toUpperCase()} booked by ${selectedAppt?.fullName}?`}
        confirmText="Reject"
        danger={true}
      />
    </div>
  );
};

export default Dashboard;
