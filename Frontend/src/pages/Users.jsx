import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as UsersIcon,
  Shield,
  Power,
  Eye,
  Trash2,
  AlertCircle,
  Search,
  UserCheck
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import StatusBadge from "../components/ui/StatusBadge";
import DataTable from "../components/ui/DataTable";
import ConfirmModal from "../components/ui/ConfirmModal";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Avatar from "../components/ui/Avatar";
import api from "../api/axios";

export const Users = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { admin: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modal actions
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to retrieve system users.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Computations for Header Stats Pills
  const userStats = useMemo(() => {
    const stats = { Active: 0, Admins: 0, Inactive: 0 };
    users.forEach((u) => {
      if (u.role === "admin") stats.Admins++;
      if (u.isActive) stats.Active++;
      else stats.Inactive++;
    });
    return stats;
  }, [users]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = u.name?.toLowerCase().includes(q);
      const emailMatch = u.email?.toLowerCase().includes(q);
      const mobileMatch = u.mobileNumber?.includes(q);
      const searchOk = !q || nameMatch || emailMatch || mobileMatch;

      const roleOk = selectedRole === "All" || u.role === selectedRole;
      
      const statusStr = u.isActive ? "Active" : "Inactive";
      const statusOk = selectedStatus === "All" || statusStr === selectedStatus;

      return searchOk && roleOk && statusOk;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  // Promote / Demote Role
  const handleOpenRoleModal = (user, e) => {
    e.stopPropagation();
    if (user._id === currentAdmin?._id) {
      addToast("You cannot change your own authorization credentials.", "warning");
      return;
    }
    setTargetUser(user);
    setShowRoleModal(true);
  };

  const handleRoleConfirm = async () => {
    if (!targetUser) return;
    const id = targetUser._id;
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    
    // Optimistic Update
    setUsers(prev =>
      prev.map(u => (u._id === id ? { ...u, role: nextRole } : u))
    );
    setShowRoleModal(false);

    try {
      addToast("Adjusting user authorization role...", "info");
      const res = await api.put(`/admin/users/role/${id}`, { role: nextRole });
      if (res.data?.success) {
        addToast(`User role updated to '${nextRole}' successfully.`, "success");
        fetchUsers();
      } else {
        fetchUsers();
        addToast("Failed to adjust user role.", "error");
      }
    } catch (err) {
      fetchUsers();
      addToast(err.response?.data?.message || "Error updating user role.", "error");
    } finally {
      setTargetUser(null);
    }
  };

  // Toggle active status
  const handleOpenStatusModal = (user, e) => {
    e.stopPropagation();
    if (user._id === currentAdmin?._id) {
      addToast("You cannot deactivate your own account.", "warning");
      return;
    }
    setTargetUser(user);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    if (!targetUser) return;
    const id = targetUser._id;
    const nextStatus = !targetUser.isActive;

    // Optimistic Update
    setUsers(prev =>
      prev.map(u => (u._id === id ? { ...u, isActive: nextStatus } : u))
    );
    setShowStatusModal(false);

    try {
      addToast("Toggling user account status...", "info");
      const res = await api.put(`/admin/users/toggle-status/${id}`);
      if (res.data?.success) {
        addToast(`User account ${nextStatus ? "activated" : "deactivated"} successfully.`, "success");
        fetchUsers();
      } else {
        fetchUsers();
        addToast("Failed to toggle status.", "error");
      }
    } catch (err) {
      fetchUsers();
      addToast(err.response?.data?.message || "Error updating account status.", "error");
    } finally {
      setTargetUser(null);
    }
  };

  // Delete User
  const handleOpenDeleteModal = (user, e) => {
    e.stopPropagation();
    if (user._id === currentAdmin?._id) {
      addToast("You cannot delete your own account.", "warning");
      return;
    }
    setTargetUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!targetUser) return;
    const id = targetUser._id;

    // Optimistic Update
    setUsers(prev => prev.filter(u => u._id !== id));
    setShowDeleteModal(false);

    try {
      addToast("Deleting user profile and history...", "info");
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data?.success) {
        addToast("User account successfully purged.", "success");
        fetchUsers();
      } else {
        fetchUsers();
        addToast("Failed to remove user.", "error");
      }
    } catch (err) {
      fetchUsers();
      addToast(err.response?.data?.message || "Error deleting user.", "error");
    } finally {
      setTargetUser(null);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Table Columns
  const tableColumns = [
    {
      label: "User Profile",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} image={row.profileImage} size={36} />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[#1A1A2E] text-sm whitespace-nowrap">{row.name}</span>
            <span className="text-[11px] text-[#6B6B8A] leading-normal">{row.email || "No email registered"}</span>
          </div>
        </div>
      )
    },
    {
      label: "Mobile Number",
      field: "mobileNumber",
      render: (row) => <span className="font-medium text-[#6B6B8A]">{row.mobileNumber || "N/A"}</span>
    },
    {
      label: "Gender",
      field: "gender",
      render: (row) => <span className="capitalize text-sm font-medium text-[#1A1A2E]">{row.gender || "other"}</span>
    },
    {
      label: "Location",
      render: (row) => (
        <span className="text-xs text-[#6B6B8A] font-medium truncate max-w-[120px] block">
          {row.state ? `${row.state}, ${row.country}` : "India"}
        </span>
      )
    },
    {
      label: "Role",
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-pill text-[11px] font-bold select-none ${
            row.role === "admin" ? "bg-[#FCE7F3] text-[#F472B6]" : "bg-[#F5F5F5] text-[#6B6B8A]"
          }`}
        >
          {row.role}
        </span>
      )
    },
    {
      label: "Account Status",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-semibold border border-transparent select-none ${
            row.isActive ? "bg-[#E0F5F5] text-[#3FA8A4]" : "bg-[#FCE7F3] text-[#EC4899]"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${row.isActive ? "bg-[#67C4C0]" : "bg-[#EC4899]"}`} />
          {row.isActive ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      label: "Joined On",
      render: (row) => <span className="text-xs text-[#A8A8C0] font-medium">{formatDate(row.createdAt)}</span>
    },
    {
      label: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          {/* Promote Role */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={row._id === currentAdmin?._id}
            onClick={(e) => handleOpenRoleModal(row, e)}
            className={`p-1.5 border rounded-btn transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              row.role === "admin"
                ? "bg-[#E0F5F5] text-[#3FA8A4] border-transparent"
                : "bg-[#FCE7F3] text-[#F472B6] border-transparent"
            }`}
            title={row.role === "admin" ? "Demote to User" : "Promote to Admin"}
          >
            <Shield className="w-3.5 h-3.5" />
          </motion.button>

          {/* Toggle status */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={row._id === currentAdmin?._id}
            onClick={(e) => handleOpenStatusModal(row, e)}
            className={`p-1.5 border rounded-btn transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              row.isActive
                ? "bg-[#E0F5F5] text-[#3FA8A4] border-transparent"
                : "bg-[#FCE7F3] text-[#EC4899] border-transparent"
            }`}
            title={row.isActive ? "Deactivate Account" : "Activate Account"}
          >
            <Power className="w-3.5 h-3.5" />
          </motion.button>

          {/* View Profile */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#FCE7F3", color: "#F472B6" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/users/${row._id}`)}
            className="p-1.5 bg-[#FDF2F8] text-[#A8A8C0] border border-[#F9D0E8] rounded-btn transition-colors"
            title="View User Details"
          >
            <Eye className="w-3.5 h-3.5 text-[#F472B6]" />
          </motion.button>

          {/* Delete User */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#FCE7F3", color: "#EC4899" }}
            whileTap={{ scale: 0.95 }}
            disabled={row._id === currentAdmin?._id}
            onClick={(e) => handleOpenDeleteModal(row, e)}
            className="p-1.5 bg-[#FCE7F3]/55 text-[#EC4899] border border-transparent rounded-btn transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Purge User & History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F9D0E8] pb-4 select-none">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-[#1A1A2E]">
            Users Manager
          </h2>
          <p className="text-xs text-[#6B6B8A] mt-1">
            Audit system client profiles, change authorization roles, and toggle status blocks
          </p>
        </div>

        {/* Counts Pills Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="px-3 py-1 bg-[#E0F5F5] text-[#3FA8A4] text-xs font-bold rounded-pill shadow-card">
            {userStats.Active} Active Users
          </span>
          <span className="px-3 py-1 bg-[#FCE7F3] text-[#F472B6] text-xs font-bold rounded-pill shadow-card">
            {userStats.Admins} Administrators
          </span>
          <span className="px-3 py-1 bg-[#F5F5F5] text-[#6B6B8A] text-xs font-bold rounded-pill shadow-card">
            {userStats.Inactive} Blocked
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#F9D0E8] rounded-card p-4 shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, mobile..."
          className="w-full md:max-w-[320px]"
        />

        <div className="flex items-center gap-3 w-full md:w-auto justify-end select-none">
          <FilterSelect
            value={selectedRole}
            onChange={setSelectedRole}
            options={[
              { value: "All", label: "All Roles" },
              { value: "user", label: "Clients" },
              { value: "admin", label: "Administrators" }
            ]}
            label="Filter Role"
          />

          <FilterSelect
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: "All", label: "All Statuses" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" }
            ]}
            label="Filter Status"
          />
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
            columns={tableColumns}
            rows={filteredUsers}
            onRowClick={(row) => navigate(`/users/${row._id}`)}
          />
        )}
      </div>

      {/* Confirm Role Promot/Demot Modal */}
      <ConfirmModal
        isOpen={showRoleModal}
        onConfirm={handleRoleConfirm}
        onCancel={() => {
          setShowRoleModal(false);
          setTargetUser(null);
        }}
        title="Change Authorization Role?"
        message={`Are you sure you want to change "${targetUser?.name}"'s system authorization status to ${
          targetUser?.role === "admin" ? "'user' (Client)" : "'admin' (Administrator)"
        }?`}
        confirmText="Confirm"
        danger={false}
      />

      {/* Confirm Toggle Status Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onConfirm={handleStatusConfirm}
        onCancel={() => {
          setShowStatusModal(false);
          setTargetUser(null);
        }}
        title={targetUser?.isActive ? "Deactivate Account?" : "Activate Account?"}
        message={`Are you sure you want to ${
          targetUser?.isActive ? "deactivate" : "activate"
        } account credentials for "${targetUser?.name}"? Blocked accounts are immediately rejected from system login screens.`}
        confirmText="Toggle"
        danger={targetUser?.isActive}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setTargetUser(null);
        }}
        title="Permanently Purge User Account?"
        message={`This will permanently delete user profile "${targetUser?.name}" and purge ALL their booking history, notes, and notifications from the system database. THIS CANNOT BE UNDONE.`}
        confirmText="Purge Account"
        danger={true}
      />
    </div>
  );
};

export default Users;
