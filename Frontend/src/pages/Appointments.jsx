import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronDown,
  Filter,
  FileText
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import StatusBadge from "../components/ui/StatusBadge";
import DataTable from "../components/ui/DataTable";
import ConfirmModal from "../components/ui/ConfirmModal";
import Avatar from "../components/ui/Avatar";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import api from "../api/axios";

export const Appointments = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(() => searchParams.get("status") || "All");
  const [selectedType, setSelectedType] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Action handling
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all system appointments
      const res = await api.get("/appointments/admin/all");
      if (res.data?.success) {
        setAppointments(res.data.data.appointments || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to retrieve system appointments.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Reactive URL update when selectedStatus changes
  useEffect(() => {
    if (selectedStatus && selectedStatus !== "All") {
      setSearchParams({ status: selectedStatus });
    } else {
      searchParams.delete("status");
      setSearchParams(searchParams);
    }
  }, [selectedStatus, setSearchParams, searchParams]);

  // Actions
  const handleApprove = async (id, e) => {
    e.stopPropagation();
    
    // Optimistic Update
    const prevAppts = [...appointments];
    setAppointments(prev =>
      prev.map(a => (a._id === id ? { ...a, status: "Approved" } : a))
    );

    try {
      addToast("Approving appointment...", "info");
      const res = await api.put(`/appointments/admin/${id}/status`, { status: "Approved" });
      if (res.data?.success) {
        addToast("Appointment approved successfully.", "success");
      } else {
        setAppointments(prevAppts);
        addToast("Failed to approve appointment.", "error");
      }
    } catch (err) {
      setAppointments(prevAppts);
      addToast(err.response?.data?.message || "Error updating appointment.", "error");
    }
  };

  const handleOpenRejectModal = (appt, e) => {
    e.stopPropagation();
    setSelectedAppt(appt);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedAppt) return;
    const id = selectedAppt._id;
    
    // Optimistic Update
    const prevAppts = [...appointments];
    setAppointments(prev =>
      prev.map(a => (a._id === id ? { ...a, status: "Rejected" } : a))
    );
    setShowRejectModal(false);

    try {
      addToast("Rejecting appointment...", "info");
      const res = await api.put(`/appointments/admin/${id}/status`, { status: "Rejected" });
      if (res.data?.success) {
        addToast("Appointment rejected successfully.", "success");
      } else {
        setAppointments(prevAppts);
        addToast("Failed to reject appointment.", "error");
      }
    } catch (err) {
      setAppointments(prevAppts);
      addToast(err.response?.data?.message || "Error updating appointment.", "error");
    } finally {
      setSelectedAppt(null);
    }
  };

  // Computations for Tab Badge Counts
  const tabCounts = useMemo(() => {
    const counts = { All: appointments.length, Pending: 0, Approved: 0, Rejected: 0, Cancelled: 0 };
    appointments.forEach((appt) => {
      if (counts[appt.status] !== undefined) {
        counts[appt.status]++;
      }
    });
    return counts;
  }, [appointments]);

  // Filtering Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const orderMatch = appt.orderNumber?.toLowerCase().includes(q) || appt._id.toLowerCase().includes(q);
      const nameMatch = appt.fullName?.toLowerCase().includes(q);
      const serviceMatch = appt.service?.name?.toLowerCase().includes(q);
      const searchOk = !q || orderMatch || nameMatch || serviceMatch;

      // 2. Status Filter
      const statusOk = selectedStatus === "All" || appt.status === selectedStatus;

      // 3. Service Type Filter
      const typeOk = selectedType === "All" || appt.serviceType === selectedType;

      // 4. Date range Filter
      let dateOk = true;
      if (dateFrom || dateTo) {
        const apptDate = new Date(appt.appointmentDate);
        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          if (apptDate < from) dateOk = false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (apptDate > to) dateOk = false;
        }
      }

      return searchOk && statusOk && typeOk && dateOk;
    });
  }, [appointments, searchQuery, selectedStatus, selectedType, dateFrom, dateTo]);

  // Format Helper
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  };

  // Table Columns Definition
  const columns = [
    {
      label: "Order #",
      render: (row) => (
        <span className="font-semibold text-[#F472B6] tracking-wide select-all font-mono">
          {row.orderNumber ? `#${row.orderNumber.split("-").pop()}` : `#SPA-${row._id.slice(-4).toUpperCase()}`}
        </span>
      )
    },
    {
      label: "Client",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Avatar name={row.fullName} size={28} />
            <span className="font-semibold text-[#1A1A2E] text-sm whitespace-nowrap">{row.fullName}</span>
          </div>
          <span className="text-[11px] text-[#6B6B8A] font-medium ml-8">{row.mobileNumber}</span>
        </div>
      )
    },
    {
      label: "Service",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#1A1A2E] text-sm truncate max-w-[160px]">
            {row.service?.name || "Therapeutic Massage"}
          </span>
          <span className="px-2 py-0.5 rounded-pill text-[10px] bg-[#E0F5F5] text-[#3FA8A4] font-semibold w-max select-none">
            {row.category?.name || "Therapy"}
          </span>
        </div>
      )
    },
    {
      label: "Type",
      render: (row) => {
        let typeColors = "bg-[#F5F5F5] text-[#6B6B8A]";
        if (row.serviceType === "VIP") typeColors = "bg-[#FCE7F3] text-[#F472B6]";
        else if (row.serviceType === "VVIP") typeColors = "bg-[#FEECEC] text-[#EC4899]";
        else if (row.serviceType === "High") typeColors = "bg-[#E0F5F5] text-[#3FA8A4]";
        return (
          <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-bold select-none ${typeColors}`}>
            {row.serviceType || "Normal"}
          </span>
        );
      }
    },
    {
      label: "Date",
      render: (row) => (
        <div className="flex flex-col gap-0.5 text-xs text-[#6B6B8A] whitespace-nowrap">
          <div className="flex items-center gap-1.5 font-medium text-[#1A1A2E]">
            <Calendar className="w-3.5 h-3.5 text-[#A8A8C0]" />
            <span>{formatDate(row.appointmentDate)}</span>
          </div>
          <span className="text-[11px] text-[#6B6B8A] font-medium ml-5">{formatTime(row.appointmentDate)}</span>
        </div>
      )
    },
    {
      label: "Price",
      render: (row) => (
        <span className="font-bold text-[#F472B6] text-sm whitespace-nowrap">
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
        <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          {row.status === "Pending" && (
            <>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#67C4C0", color: "#FFFFFF" }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleApprove(row._id, e)}
                className="p-1.5 bg-[#E0F5F5] text-[#3FA8A4] border-none rounded-btn transition-all"
                aria-label="Approve Appointment"
              >
                <CheckCircle2 className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#F472B6", color: "#FFFFFF" }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleOpenRejectModal(row, e)}
                className="p-1.5 bg-[#FCE7F3] text-[#EC4899] border-none rounded-btn transition-all"
                aria-label="Reject Appointment"
              >
                <XCircle className="w-4 h-4" />
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#FCE7F3", color: "#F472B6" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/appointments/${row._id}`)}
            className="p-1.5 bg-[#FDF2F8] text-[#A8A8C0] border border-[#F9D0E8] rounded-btn transition-all"
            aria-label="View Appointment Specification"
          >
            <Eye className="w-4 h-4 text-[#F472B6]" />
          </motion.button>
        </div>
      )
    }
  ];

  const statusTabs = ["All", "Pending", "Approved", "Rejected", "Cancelled"];

  const serviceTypeOptions = [
    { value: "All", label: "All Types" },
    { value: "Normal", label: "Normal" },
    { value: "High", label: "High" },
    { value: "VIP", label: "VIP" },
    { value: "VVIP", label: "VVIP" }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-[#F9D0E8] pb-4 select-none">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-[#1A1A2E]">
            Appointments Board
          </h2>
          <p className="text-xs text-[#6B6B8A] mt-1">
            Manage, filter, and review system client booking requests
          </p>
        </div>
        
        {/* Total Badge */}
        <div className="px-3.5 py-1 bg-[#FCE7F3] text-[#F472B6] text-xs font-bold rounded-pill shadow-card">
          {appointments.length} Total Bookings
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white border border-[#F9D0E8] rounded-card p-5 shadow-card flex flex-col gap-5">
        {/* Search & Select Grid */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by order, client, service..."
            className="max-w-full lg:max-w-[320px]"
          />

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Service Type Select */}
            <FilterSelect
              value={selectedType}
              onChange={setSelectedType}
              options={serviceTypeOptions}
              label="Service Type"
            />

            {/* Date Inputs */}
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-36">
                <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold text-[#6B6B8A] z-10 select-none">
                  Date From
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-full pl-3 pr-2 bg-white border border-[#F9D0E8] rounded-btn text-xs text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none cursor-pointer"
                />
              </div>
              <span className="text-xs text-[#A8A8C0] font-bold select-none">to</span>
              <div className="relative h-10 w-36">
                <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-bold text-[#6B6B8A] z-10 select-none">
                  Date To
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-full pl-3 pr-2 bg-white border border-[#F9D0E8] rounded-btn text-xs text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Tab Pills Row */}
        <div className="flex flex-wrap gap-2 border-t border-[#F0F0F5] pt-4">
          {statusTabs.map((tab) => {
            const isTabActive = selectedStatus === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedStatus(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-pill text-xs font-semibold select-none border-none transition-all duration-150 ${
                  isTabActive
                    ? "bg-[#F472B6] text-white shadow-btn"
                    : "bg-[#FCE7F3]/40 text-[#F472B6] hover:bg-[#FCE7F3]/80"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isTabActive ? "text-white" : "bg-[#F472B6]/15 text-[#F472B6]"
                  }`}
                  style={isTabActive ? { backgroundColor: "rgba(255, 255, 255, 0.25)" } : undefined}
                >
                  {tabCounts[tab]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table view */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="w-full h-80 bg-white border border-[#F9D0E8] rounded-card p-6 shadow-card flex items-center justify-center">
            <LoadingSkeleton type="row" count={6} className="w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredAppointments}
            onRowClick={(row) => navigate(`/appointments/${row._id}`)}
          />
        )}
      </div>

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onConfirm={handleRejectConfirm}
        onCancel={() => {
          setShowRejectModal(false);
          setSelectedAppt(null);
        }}
        title="Reject Appointment Request?"
        message={`This will decline SPA-${selectedAppt?.orderNumber?.split("-").pop() || selectedAppt?._id?.slice(-4).toUpperCase()} requested by ${selectedAppt?.fullName}. Client will be notified immediately.`}
        confirmText="Reject"
        danger={true}
      />
    </div>
  );
};

export default Appointments;
