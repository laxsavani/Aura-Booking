import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import StatusBadge from "../components/ui/StatusBadge";
import Avatar from "../components/ui/Avatar";
import ConfirmModal from "../components/ui/ConfirmModal";
import PageLoader from "../components/ui/PageLoader";
import api from "../api/axios";

export const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal and action states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointmentDetail = useCallback(async () => {
    try {
      const res = await api.get(`/appointments/admin/${id}`);
      if (res.data?.success) {
        setAppt(res.data.data.appointment);
      } else {
        addToast("Appointment not found.", "error");
        navigate("/appointments");
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to load appointment details.", "error");
      navigate("/appointments");
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchAppointmentDetail();
  }, [fetchAppointmentDetail]);

  const handleUpdateStatus = async (status) => {
    setActionLoading(true);
    try {
      addToast(`Updating status to ${status}...`, "info");
      const res = await api.put(`/appointments/admin/${id}/status`, { status });
      if (res.data?.success) {
        addToast(`Appointment status updated to '${status}'.`, "success");
        fetchAppointmentDetail();
      } else {
        addToast("Failed to update appointment status.", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Error updating appointment.", "error");
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast("Order number copied to clipboard.", "success");
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!appt) {
    return null;
  }

  // Format Helper
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
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

  const orderNum = appt.orderNumber || `SPA-${appt._id.slice(-8).toUpperCase()}`;

  // Custom Timeline calculations
  const isPending = appt.status === "Pending";
  const isApproved = appt.status === "Approved";
  const isRejected = appt.status === "Rejected";
  const isCancelled = appt.status === "Cancelled";

  return (
    <div className="flex flex-col gap-6 select-none font-sans">
      {/* Back Button Row */}
      <button
        onClick={() => navigate("/appointments")}
        className="flex items-center gap-2 text-xs font-bold text-[#F472B6] hover:text-[#EC4899] transition-colors w-max"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Appointments</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F9D0E8] pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-[#1A1A2E]">
            {orderNum}
          </h2>
          <p className="text-xs text-[#6B6B8A] mt-1">
            Booked on {new Date(appt.createdAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={appt.status} size="md" />
      </div>

      {/* Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Details - 2/3 wide) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card 1: Appointment Info */}
          <div className="bg-white border border-[#F9D0E8] rounded-card p-6 shadow-card flex flex-col gap-5">
            <h3 className="text-base font-semibold text-[#1A1A2E] border-b border-[#F0F0F5] pb-3">
              Appointment Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Order ID */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#A8A8C0] uppercase font-bold tracking-wider">
                  Order Reference
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1A1A2E] font-mono">{orderNum}</span>
                  <button
                    onClick={() => copyToClipboard(orderNum)}
                    className="p-1 hover:bg-[#FDF2F8] rounded text-[#A8A8C0] hover:text-[#F472B6] transition-colors"
                    title="Copy to Clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Service Type */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#A8A8C0] uppercase font-bold tracking-wider">
                  Service Type Tier
                </span>
                <span className="w-max px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-[#E0F5F5] text-[#3FA8A4]">
                  {appt.serviceType || "Normal"}
                </span>
              </div>

              {/* Appointment Date */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#A8A8C0] uppercase font-bold tracking-wider">
                  Schedule Date & Time
                </span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1A1A2E]">
                  <Calendar className="w-4 h-4 text-[#F472B6]" />
                  <span>{formatDate(appt.appointmentDate)}</span>
                  <span className="text-xs text-[#6B6B8A] font-medium ml-1">
                    @{formatTime(appt.appointmentDate)}
                  </span>
                </div>
              </div>

              {/* Final Price */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#A8A8C0] uppercase font-bold tracking-wider">
                  Amount Charged
                </span>
                <span className="text-xl font-display font-bold text-[#F472B6]">
                  ₹{(appt.price || appt.service?.finalPrice || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Service details nested row */}
            {appt.service && (
              <div className="border-t border-[#F9D0E8] pt-5 mt-2 flex flex-col md:flex-row gap-4 items-center">
                {appt.service.photo ? (
                  <img
                    src={appt.service.photo}
                    alt={appt.service.name}
                    className="w-16 h-16 rounded-[10px] object-cover border border-[#F9D0E8]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-[10px] bg-[#FCE7F3] flex items-center justify-center text-[#F472B6]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 flex flex-col gap-0.5 text-center md:text-left">
                  <span className="text-sm font-bold text-[#1A1A2E]">{appt.service.name}</span>
                  <span className="text-xs text-[#6B6B8A] line-clamp-1 max-w-lg">
                    {appt.service.description}
                  </span>
                  <div className="flex items-center gap-2 mt-1.5 justify-center md:justify-start">
                    <span className="px-2 py-0.5 bg-[#E0F5F5] text-[#3FA8A4] text-[10px] font-bold rounded-pill">
                      {appt.category?.name || "Therapy"}
                    </span>
                    <span className="px-2 py-0.5 bg-[#FCE7F3] text-[#F472B6] text-[10px] font-bold rounded-pill">
                      ₹{appt.service.finalPrice || appt.service.price}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Notes */}
            {appt.notes && (
              <div className="bg-[#FDF2F8]/40 border border-[#F9D0E8]/55 rounded-[12px] p-4 flex flex-col gap-1.5 mt-2">
                <span className="text-[10px] text-[#A8A8C0] uppercase font-bold tracking-wider">
                  Client Remarks / Booking Notes
                </span>
                <p className="text-sm text-[#1A1A2E] italic leading-relaxed">
                  "{appt.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Card 2: Client Info */}
          <div className="bg-white border border-[#F9D0E8] rounded-card p-6 shadow-card flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[#1A1A2E] border-b border-[#F0F0F5] pb-3">
              Client Details
            </h3>

            <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
              <Avatar name={appt.fullName} size={56} className="mt-1" />
              
              <div className="flex-grow flex flex-col gap-4 text-center md:text-left">
                <div>
                  <h4 className="text-base font-bold text-[#1A1A2E]">{appt.fullName}</h4>
                  <p className="text-xs text-[#A8A8C0]">Client Account Profile</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-center md:justify-start gap-2.5 text-sm text-[#6B6B8A]">
                    <Mail className="w-4 h-4 text-[#A8A8C0] flex-shrink-0" />
                    <span className="truncate">{appt.user?.email || "No email registered"}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2.5 text-sm text-[#6B6B8A]">
                    <Phone className="w-4 h-4 text-[#A8A8C0] flex-shrink-0" />
                    <span>{appt.mobileNumber}</span>
                  </div>
                  <div className="flex items-start justify-center md:justify-start gap-2.5 text-sm text-[#6B6B8A] md:col-span-2">
                    <MapPin className="w-4 h-4 text-[#A8A8C0] flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col items-center md:items-start">
                      <span>{appt.address}</span>
                      <span className="text-xs text-[#A8A8C0] mt-0.5 font-medium">
                        {appt.state}, {appt.country}
                      </span>
                    </div>
                  </div>
                </div>

                {appt.user?._id && (
                  <button
                    onClick={() => navigate(`/users/${appt.user._id}`)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#F472B6] hover:text-[#EC4899] transition-colors mt-2 self-center md:self-start border-none bg-transparent"
                  >
                    <span>View Full Account Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Controls - 1/3 wide) */}
        <div className="flex flex-col gap-6">
          {/* Card 1: Status Management */}
          <div className="bg-white border border-[#F9D0E8] rounded-card p-5 shadow-card flex flex-col gap-5">
            <h3 className="text-base font-semibold text-[#1A1A2E] border-b border-[#F0F0F5] pb-3">
              Manage Status
            </h3>

            <div className="flex flex-col items-center justify-center text-center p-4 bg-[#FDF2F8]/30 rounded-[12px] border border-[#F9D0E8]/40">
              <span className="text-[10px] text-[#A8A8C0] uppercase font-bold tracking-wider mb-2">
                Current Booking Status
              </span>
              <StatusBadge status={appt.status} size="md" />
            </div>

            {/* State Actions */}
            {isPending && (
              <div className="flex flex-col gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus("Approved")}
                  className="w-full h-12 bg-[#67C4C0] hover:bg-[#3FA8A4] text-white text-sm font-semibold rounded-btn shadow-card flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>Approve Appointment</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={actionLoading}
                  onClick={() => setShowRejectModal(true)}
                  className="w-full h-12 border border-[#EC4899] text-[#EC4899] hover:bg-[#FCE7F3]/40 text-sm font-semibold rounded-btn flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4.5 h-4.5" />
                  <span>Reject Appointment</span>
                </motion.button>
                <div className="flex gap-2 p-3 bg-[#FCE7F3]/40 rounded-[10px] mt-1 items-start text-left">
                  <Clock className="w-4 h-4 text-[#F472B6] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#6B6B8A] leading-normal">
                    Client will be notified in-app immediately upon approving or rejecting this booking.
                  </p>
                </div>
              </div>
            )}

            {isApproved && (
              <div className="bg-[#E0F5F5] rounded-[12px] p-5 flex flex-col items-center justify-center gap-2 text-center border border-[#E0F5F5]">
                <CheckCircle className="w-8 h-8 text-[#67C4C0] animate-bounce" />
                <div>
                  <h4 className="text-sm font-bold text-[#3FA8A4]">Appointment Approved</h4>
                  <p className="text-xs text-[#6B6B8A] mt-1 leading-normal">
                    This booking has been authorized. Scheduling slots have been confirmed.
                  </p>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="bg-[#FCE7F3] rounded-[12px] p-5 flex flex-col items-center justify-center gap-3 text-center border border-[#FCE7F3]">
                <XCircle className="w-8 h-8 text-[#EC4899]" />
                <div>
                  <h4 className="text-sm font-bold text-[#EC4899]">Appointment Rejected</h4>
                  <p className="text-xs text-[#6B6B8A] mt-1 leading-normal">
                    This booking request has been declined.
                  </p>
                </div>
                {/* Reopen capability */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleUpdateStatus("Pending")}
                  className="px-3.5 py-1.5 text-xs bg-white text-[#F472B6] border border-[#F9D0E8] rounded-pill font-semibold shadow-card hover:bg-[#FCE7F3]/20 transition-colors"
                >
                  Mark as Pending
                </motion.button>
              </div>
            )}

            {isCancelled && (
              <div className="bg-[#F5F5F5] rounded-[12px] p-5 flex flex-col items-center justify-center gap-2 text-center border border-[#F5F5F5]">
                <AlertCircle className="w-8 h-8 text-[#6B6B8A]" />
                <div>
                  <h4 className="text-sm font-bold text-[#6B6B8A]">Booking Cancelled</h4>
                  <p className="text-xs text-[#6B6B8A] mt-1 leading-normal">
                    This appointment was cancelled by the client.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Status Timeline */}
          <div className="bg-white border border-[#F9D0E8] rounded-card p-5 shadow-card flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[#1A1A2E] border-b border-[#F0F0F5] pb-3">
              Status Timeline
            </h3>

            {/* Timeline Items */}
            <div className="flex flex-col gap-6 pl-2 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#F9D0E8]">
              {/* Step 1: Booked */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-[#E0F5F5] flex items-center justify-center border-2 border-white shadow-card">
                  <CheckCircle className="w-3.5 h-3.5 text-[#67C4C0]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#1A1A2E]">Booked by Client</span>
                  <span className="text-[10px] text-[#A8A8C0] mt-0.5">
                    {new Date(appt.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="flex items-start gap-4 relative z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-card ${
                    isPending ? "bg-[#FDF2F8]" : "bg-[#E0F5F5]"
                  }`}
                >
                  {isPending ? (
                    <Clock className="w-3.5 h-3.5 text-[#F472B6]" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-[#67C4C0]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#1A1A2E]">Under Review</span>
                  <span className="text-[10px] text-[#A8A8C0] mt-0.5">
                    {isPending ? "Awaiting admin audit" : "Audited by administrator"}
                  </span>
                </div>
              </div>

              {/* Step 3: Final Resolution */}
              <div className="flex items-start gap-4 relative z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-card ${
                    isPending
                      ? "bg-[#F5F5F5]"
                      : isApproved
                      ? "bg-[#E0F5F5]"
                      : isRejected
                      ? "bg-[#FCE7F3]"
                      : "bg-[#F5F5F5]"
                  }`}
                >
                  {isPending ? (
                    <Clock className="w-3.5 h-3.5 text-[#6B6B8A]" />
                  ) : isApproved ? (
                    <CheckCircle className="w-3.5 h-3.5 text-[#67C4C0]" />
                  ) : isRejected ? (
                    <XCircle className="w-3.5 h-3.5 text-[#EC4899]" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-[#6B6B8A]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#1A1A2E]">
                    {isPending
                      ? "Final Resolution"
                      : isApproved
                      ? "Booking Approved"
                      : isRejected
                      ? "Booking Rejected"
                      : "Booking Cancelled"}
                  </span>
                  <span className="text-[10px] text-[#A8A8C0] mt-0.5">
                    {isPending ? "Awaiting confirmation" : `Resolved on ${new Date(appt.updatedAt).toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal Confirmation */}
      <ConfirmModal
        isOpen={showRejectModal}
        onConfirm={() => handleUpdateStatus("Rejected")}
        onCancel={() => setShowRejectModal(false)}
        title="Reject Appointment?"
        message={`Are you sure you want to decline booking reference ${orderNum}? This action notifies the client immediately.`}
        confirmText="Reject"
        danger={true}
      />
    </div>
  );
};

export default AppointmentDetail;
