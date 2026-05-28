import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Grid,
  List,
  Pencil,
  Trash2,
  UploadCloud,
  X,
  Zap,
  Star,
  Crown,
  Gem,
  Check,
  Eye,
  AlertCircle
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import StatusBadge from "../components/ui/StatusBadge";
import DataTable from "../components/ui/DataTable";
import DrawerPanel from "../components/ui/DrawerPanel";
import ConfirmModal from "../components/ui/ConfirmModal";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Avatar from "../components/ui/Avatar";
import api from "../api/axios";

export const Services = () => {
  const { addToast } = useToast();
  const location = useLocation();

  // Listing and visual toggle states
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Drawer form states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add"); // 'add' or 'edit'
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDiscount, setFormDiscount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formType, setFormType] = useState("Normal");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formFile, setFormFile] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState("");

  const fileInputRef = useRef(null);

  // Modal deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch Services & Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/home/category");
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      // In the backend routes/home.routes.js:
      // GET /api/home/services retrieves active services.
      // Since there's no admin-specific list, we fetch from `/home/services`.
      const res = await api.get("/home/services");
      if (res.data?.success) {
        setServices(res.data.data.services || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to retrieve services catalog.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [fetchCategories, fetchServices]);

  // Check if routed with request to open the add drawer (from Quick Actions)
  useEffect(() => {
    if (location.state?.openAddDrawer) {
      handleOpenAddDrawer();
      // Clear location state to prevent reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Final Price live computed display
  const finalPrice = useMemo(() => {
    const base = parseFloat(formPrice) || 0;
    const disc = parseFloat(formDiscount) || 0;
    if (disc <= 0) return base;
    const computed = base - (base * disc) / 100;
    return Math.max(0, Math.round(computed));
  }, [formPrice, formDiscount]);

  // Filters mapping
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = srv.name?.toLowerCase().includes(q) || srv.title?.toLowerCase().includes(q);
      const descMatch = srv.description?.toLowerCase().includes(q);
      const searchOk = !q || nameMatch || descMatch;

      const categoryOk = selectedCategory === "All" || srv.category?._id === selectedCategory || srv.category === selectedCategory;
      const typeOk = selectedType === "All" || srv.serviceType === selectedType;
      
      const statusStr = srv.isActive ? "Active" : "Inactive";
      const statusOk = selectedStatus === "All" || statusStr === selectedStatus;

      return searchOk && categoryOk && typeOk && statusOk;
    });
  }, [services, searchQuery, selectedCategory, selectedType, selectedStatus]);

  // Category select options builder
  const categoryOptions = useMemo(() => {
    const opts = [{ value: "All", label: "All Categories" }];
    categories.forEach((cat) => {
      opts.push({ value: cat._id, label: cat.name });
    });
    return opts;
  }, [categories]);

  const formCategoryOptions = useMemo(() => {
    const opts = [{ value: "", label: "Select associated category..." }];
    categories.forEach((cat) => {
      opts.push({ value: cat._id, label: cat.name });
    });
    return opts;
  }, [categories]);

  // Drawer triggers
  const handleOpenAddDrawer = () => {
    setDrawerMode("add");
    setSelectedServiceId(null);
    setFormName("");
    setFormDescription("");
    setFormTitle("");
    setFormPrice("");
    setFormDiscount("0");
    setFormCategory("");
    setFormType("Normal");
    setFormIsActive(true);
    setFormFile(null);
    setFormImagePreview("");
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (srv) => {
    setDrawerMode("edit");
    setSelectedServiceId(srv._id);
    setFormName(srv.name);
    setFormDescription(srv.description);
    setFormTitle(srv.title || "");
    setFormPrice(srv.price.toString());
    setFormDiscount(srv.discount.toString());
    setFormCategory(srv.category?._id || srv.category || "");
    setFormType(srv.serviceType || "Normal");
    setFormIsActive(srv.isActive !== undefined ? srv.isActive : true);
    setFormFile(null);
    setFormImagePreview(srv.photo || "");
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  // Drag and Drop handles
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast("File size too large. JPG, PNG up to 5MB only.", "warning");
        return;
      }
      setFormFile(file);
      setFormImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast("File size exceeds 5MB limit.", "warning");
        return;
      }
      setFormFile(file);
      setFormImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormFile(null);
    setFormImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formName.trim()) errors.name = "Service name is required.";
    if (!formDescription.trim()) errors.description = "Service description is required.";
    if (!formPrice.trim() || isNaN(parseFloat(formPrice)) || parseFloat(formPrice) <= 0) {
      errors.price = "Enter a valid base price above 0.";
    }
    const discNum = parseFloat(formDiscount);
    if (formDiscount.trim() && (isNaN(discNum) || discNum < 0 || discNum > 100)) {
      errors.discount = "Discount must be between 0 and 100%.";
    }
    if (!formCategory) errors.category = "Please associate with a category.";
    
    if (drawerMode === "add" && !formFile) {
      errors.photo = "Service catalog photo is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Service handler (Add/Edit)
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaveLoading(true);
    
    // Construct FormData for multipart submission
    const formData = new FormData();
    formData.append("name", formName.trim());
    formData.append("description", formDescription.trim());
    formData.append("title", formTitle.trim());
    formData.append("price", formPrice);
    formData.append("discount", formDiscount || "0");
    formData.append("categoryId", formCategory);
    formData.append("serviceType", formType);
    formData.append("isActive", formIsActive);
    if (formFile) {
      formData.append("photo", formFile);
    }

    try {
      if (drawerMode === "add") {
        addToast("Creating service entry...", "info");
        const res = await api.post("/home/add-service", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data?.success) {
          addToast("Service created successfully.", "success");
          setIsDrawerOpen(false);
          fetchServices();
        }
      } else {
        addToast("Updating service entry...", "info");
        const res = await api.put(`/home/update-service/${selectedServiceId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data?.success) {
          addToast("Service updated successfully.", "success");
          setIsDrawerOpen(false);
          fetchServices();
        }
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to save service. Check files.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Deactivate toggle inline Table
  const handleToggleActive = async (srv, e) => {
    e.stopPropagation();
    const newStatus = !srv.isActive;

    // Optimistic Update
    setServices(prev =>
      prev.map(s => (s._id === srv._id ? { ...s, isActive: newStatus } : s))
    );

    try {
      const res = await api.put(`/home/update-service/${srv._id}`, { isActive: newStatus });
      if (res.data?.success) {
        addToast(`Service published status toggled.`, "success");
      } else {
        fetchServices();
        addToast("Failed to toggle status.", "error");
      }
    } catch (err) {
      fetchServices();
      addToast("Failed to communicate update.", "error");
    }
  };

  // Delete handlers
  const handleOpenDeleteModal = (srv, e) => {
    e.stopPropagation();
    setDeleteTargetId(srv._id);
    setDeleteTargetName(srv.name);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    // Optimistic Update
    setServices(prev => prev.filter(s => s._id !== deleteTargetId));
    setShowDeleteModal(false);

    try {
      addToast("Deleting service...", "info");
      const res = await api.delete(`/home/delete-service/${deleteTargetId}`);
      if (res.data?.success) {
        addToast("Service removed from catalog.", "success");
        fetchServices();
      } else {
        fetchServices();
        addToast("Failed to remove service.", "error");
      }
    } catch (err) {
      fetchServices();
      addToast(err.response?.data?.message || "Error deleting service.", "error");
    } finally {
      setDeleteTargetId(null);
      setDeleteTargetName("");
    }
  };

  // DataTable columns
  const tableColumns = [
    {
      label: "Photo",
      render: (row) => (
        <img
          src={row.photo}
          alt={row.name}
          className="w-12 h-12 rounded-[10px] object-cover border border-[#F9D0E8] select-none"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )
    },
    {
      label: "Name",
      render: (row) => (
        <div className="flex flex-col gap-0.5 max-w-sm">
          <span className="font-semibold text-[#1A1A2E] text-sm truncate">{row.name}</span>
          <span className="text-[11px] text-[#6B6B8A] leading-normal line-clamp-1">
            {row.description}
          </span>
        </div>
      )
    },
    {
      label: "Category",
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-pill text-[11px] bg-[#E0F5F5] text-[#3FA8A4] font-semibold select-none">
          {row.category?.name || "Therapy"}
        </span>
      )
    },
    {
      label: "Type",
      render: (row) => {
        let typeColors = "bg-[#F5F5F5] text-[#6B6B8A]";
        if (row.serviceType === "VIP") typeColors = "bg-[#FCE7F3] text-[#F472B6]";
        else if (row.serviceType === "VVIP") typeColors = "bg-[#FCE7F3] text-[#EC4899]";
        else if (row.serviceType === "High") typeColors = "bg-[#E0F5F5] text-[#3FA8A4]";
        return (
          <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-bold select-none ${typeColors}`}>
            {row.serviceType || "Normal"}
          </span>
        );
      }
    },
    {
      label: "Base Price",
      render: (row) => (
        <span className="text-sm font-medium text-[#6B6B8A]">
          ₹{row.price.toLocaleString()}
        </span>
      )
    },
    {
      label: "Final Price",
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-[#F472B6] text-sm">
            ₹{row.finalPrice.toLocaleString()}
          </span>
          {row.discount > 0 && (
            <span className="px-1.5 py-0.5 bg-[#E0F5F5] text-[#3FA8A4] text-[9px] font-bold rounded-pill">
              -{row.discount}%
            </span>
          )}
        </div>
      )
    },
    {
      label: "Status",
      render: (row) => (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          {/* Custom Switch toggle */}
          <button
            onClick={(e) => handleToggleActive(row, e)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors border-none cursor-pointer flex items-center ${
              row.isActive ? "bg-[#F472B6]" : "bg-[#F0F0F5]"
            }`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-4 h-4 rounded-full bg-white shadow-md block"
              style={{ marginLeft: row.isActive ? "auto" : "0" }}
            />
          </button>
        </div>
      )
    },
    {
      label: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#FCE7F3", color: "#F472B6" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenEditDrawer(row)}
            className="p-1.5 bg-[#FDF2F8] text-[#A8A8C0] border border-[#F9D0E8] rounded-btn transition-colors"
            aria-label="Edit Catalog Service"
          >
            <Pencil className="w-3.5 h-3.5 text-[#F472B6]" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#FCE7F3", color: "#EC4899" }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleOpenDeleteModal(row, e)}
            className="p-1.5 bg-[#FCE7F3]/55 text-[#EC4899] border border-transparent rounded-btn transition-colors"
            aria-label="Delete Catalog Service"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      )
    }
  ];

  // Drawer Footer layout
  const drawerFooter = (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsDrawerOpen(false)}
        type="button"
        className="px-5 py-2.5 border border-[#F9D0E8] text-[#F472B6] hover:bg-[#FDF2F8] text-sm font-semibold rounded-btn transition-colors"
      >
        Cancel
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        disabled={saveLoading}
        onClick={handleSaveService}
        className="px-5 py-2.5 bg-[#F472B6] hover:bg-[#EC4899] text-white text-sm font-semibold rounded-btn shadow-btn flex items-center gap-2 transition-colors disabled:opacity-50"
      >
        {saveLoading && (
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        <span>Save Service</span>
      </motion.button>
    </>
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-[#F9D0E8] pb-4 select-none">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-[#1A1A2E]">
            Services Catalog
          </h2>
          <p className="text-xs text-[#6B6B8A] mt-1">
            Maintain catalog pricing, tiers, and descriptions for spa services
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 6px 24px rgba(244,114,182,0.30)" }}
          whileTap={{ scale: 0.96 }}
          onClick={handleOpenAddDrawer}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F472B6] hover:bg-[#EC4899] text-white text-sm font-semibold rounded-btn shadow-btn transition-colors"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add New Service</span>
        </motion.button>
      </div>

      {/* Filter and View Toggles Bar */}
      <div className="bg-white border border-[#F9D0E8] rounded-card p-4 shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Select filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search services..."
            className="w-full md:max-w-[220px]"
          />

          <FilterSelect
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            label="Category"
          />

          <FilterSelect
            value={selectedType}
            onChange={setSelectedType}
            options={[
              { value: "All", label: "All Tiers" },
              { value: "Normal", label: "Normal" },
              { value: "High", label: "High" },
              { value: "VIP", label: "VIP" },
              { value: "VVIP", label: "VVIP" }
            ]}
            label="Tier Type"
          />

          <FilterSelect
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: "All", label: "All Statuses" },
              { value: "Active", label: "Published" },
              { value: "Inactive", label: "Unpublished" }
            ]}
            label="Status"
          />
        </div>

        {/* Grid/Table view toggles */}
        <div className="flex items-center border border-[#F9D0E8] rounded-btn p-0.5 select-none bg-[#FDF2F8]/30 flex-shrink-0 self-end md:self-center">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-btn flex items-center justify-center border-none transition-colors duration-150 ${
              viewMode === "table" ? "bg-[#F472B6] text-white shadow-sm" : "text-[#A8A8C0] hover:text-[#F472B6]"
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-btn flex items-center justify-center border-none transition-colors duration-150 ${
              viewMode === "grid" ? "bg-[#F472B6] text-white shadow-sm" : "text-[#A8A8C0] hover:text-[#F472B6]"
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Services view container */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="w-full h-80 bg-white border border-[#F9D0E8] rounded-card p-6 shadow-card flex items-center justify-center">
            <LoadingSkeleton type="row" count={5} className="w-full" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white border border-[#F9D0E8] rounded-card p-12 text-center shadow-card flex items-center justify-center">
            <div className="max-w-md flex flex-col items-center gap-2">
              <Sparkles className="w-12 h-12 text-[#A8A8C0]" />
              <h3 className="text-base font-semibold text-[#1A1A2E] mt-3">No services found</h3>
              <p className="text-xs text-[#6B6B8A] leading-normal">
                There are no catalog items matching the search query or filters.
              </p>
            </div>
          </div>
        ) : viewMode === "table" ? (
          /* Table Layout */
          <DataTable
            columns={tableColumns}
            rows={filteredServices}
            onRowClick={(row) => handleOpenEditDrawer(row)}
          />
        ) : (
          /* Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((srv) => (
              <motion.div
                key={srv._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(244,114,182,0.18)" }}
                className="bg-white border border-[#F9D0E8] rounded-card shadow-card overflow-hidden cursor-pointer relative group flex flex-col h-[280px]"
                onClick={() => handleOpenEditDrawer(srv)}
              >
                {/* Photo Header */}
                <div className="h-36 w-full overflow-hidden relative select-none">
                  <img
                    src={srv.photo}
                    alt={srv.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    <span className="px-2 py-0.5 bg-[#E0F5F5] text-[#3FA8A4] text-[10px] font-bold rounded-pill shadow-sm">
                      {srv.category?.name || "Therapy"}
                    </span>
                    {!srv.isActive && (
                      <span className="px-2 py-0.5 bg-[#F5F5F5] text-[#6B6B8A] text-[10px] font-bold rounded-pill shadow-sm">
                        Unpublished
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-sm font-bold text-[#1A1A2E] truncate flex-1">{srv.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A8C0]">
                        {srv.serviceType}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B6B8A] leading-relaxed line-clamp-2 mt-1">
                      {srv.description}
                    </p>
                  </div>

                  <div className="flex items-end justify-between border-t border-[#F0F0F5] pt-3 mt-2">
                    <div className="flex flex-col">
                      {srv.discount > 0 && (
                        <span className="text-[10px] text-[#A8A8C0] line-through">
                          ₹{srv.price}
                        </span>
                      )}
                      <span className="text-base font-bold text-[#F472B6]">
                        ₹{srv.finalPrice.toLocaleString()}
                      </span>
                    </div>

                    {srv.discount > 0 && (
                      <span className="px-1.5 py-0.5 bg-[#E0F5F5] text-[#3FA8A4] text-[10px] font-bold rounded-pill">
                        -{srv.discount}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin action overlays on card hover */}
                <div className="absolute inset-0 bg-[#1A1A2E]/45 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-200 z-10 pointer-events-none group-hover:pointer-events-auto">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDrawer(srv);
                    }}
                    className="p-2.5 bg-white text-[#F472B6] rounded-full shadow-lg hover:bg-[#FCE7F3] border-none"
                    aria-label="Edit"
                  >
                    <Pencil className="w-4.5 h-4.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeleteModal(srv, e);
                    }}
                    className="p-2.5 bg-[#EC4899] text-white rounded-full shadow-lg hover:bg-[#D0357F] border-none"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTargetId(null);
          setDeleteTargetName("");
        }}
        title="Delete Service?"
        message={`Are you sure you want to permanently delete "${deleteTargetName}"? This will clean up the service details and purge image files from Cloudinary storage.`}
        confirmText="Delete"
        danger={true}
      />

      {/* Add/Edit Drawer Panel */}
      <DrawerPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === "add" ? "Add New Service" : "Edit Service Details"}
        footer={drawerFooter}
      >
        <form className="flex flex-col gap-5 select-none" onSubmit={handleSaveService}>
          {/* Dash photo drag zone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B6B8A]">
              Service Catalog Photo <span className="text-[#EC4899] font-bold">*</span>
            </label>
            
            {formImagePreview ? (
              <div className="relative w-full h-40 rounded-card overflow-hidden border border-[#F9D0E8] select-none">
                <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors border-none"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-40 rounded-card border-2 border-dashed border-[#F9D0E8] hover:border-[#F472B6] hover:bg-[#FDF2F8]/40 transition-all duration-150 flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center ${
                  formErrors.photo ? "border-[#EC4899] bg-[#FCE7F3]/10" : ""
                }`}
              >
                <UploadCloud className="w-9 h-9 text-[#F472B6] animate-pulse" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[#1A1A2E]">
                    Drag & drop or click to upload
                  </span>
                  <span className="text-[10px] text-[#A8A8C0]">
                    JPG, PNG, WEBP files up to 5MB limit
                  </span>
                </div>
                {formErrors.photo && (
                  <span className="text-[10px] text-[#EC4899] font-bold mt-1">
                    {formErrors.photo}
                  </span>
                )}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Name input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B6B8A]">
              Service Name <span className="text-[#EC4899] font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Swedish Relaxation Massage"
              className={`w-full h-11 px-3.5 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none ${
                formErrors.name ? "border-[#EC4899]" : ""
              }`}
            />
            {formErrors.name && (
              <span className="text-[10px] text-[#EC4899] font-bold">{formErrors.name}</span>
            )}
          </div>

          {/* Description input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B6B8A]">
              Description <span className="text-[#EC4899] font-bold">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Provide a detailed description of soft-tissue kneads, aromatic oils, towels, or steps..."
              className={`w-full p-3 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none resize-none ${
                formErrors.description ? "border-[#EC4899]" : ""
              }`}
            />
            {formErrors.description && (
              <span className="text-[10px] text-[#EC4899] font-bold">{formErrors.description}</span>
            )}
          </div>

          {/* Promotion title subtitle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B6B8A]">
              Promotional Subtitle <span className="text-xs text-[#A8A8C0] font-medium">(Optional)</span>
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Pure Restorative Indulgence"
              className="w-full h-11 px-3.5 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none"
            />
          </div>

          {/* Price and Discount row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#6B6B8A]">
                Base Price (₹) <span className="text-[#EC4899] font-bold">*</span>
              </label>
              <div className="relative h-11">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sm text-[#A8A8C0] font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="2500"
                  className={`w-full h-full pl-7 pr-3 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none ${
                    formErrors.price ? "border-[#EC4899]" : ""
                  }`}
                />
              </div>
              {formErrors.price && (
                <span className="text-[10px] text-[#EC4899] font-bold">{formErrors.price}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#6B6B8A]">
                Discount (%)
              </label>
              <div className="relative h-11">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(e.target.value)}
                  placeholder="0"
                  className={`w-full h-full pl-3 pr-8 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none ${
                    formErrors.discount ? "border-[#EC4899]" : ""
                  }`}
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-sm text-[#A8A8C0] font-semibold">
                  %
                </span>
              </div>
              {formErrors.discount && (
                <span className="text-[10px] text-[#EC4899] font-bold">{formErrors.discount}</span>
              )}
            </div>
          </div>

          {/* Computed Final Price Display */}
          <div className="p-3 bg-[#FCE7F3] border border-[#FCE7F3] rounded-[10px] text-center select-none">
            <span className="text-xs font-bold text-[#6B6B8A] uppercase tracking-wider block">
              Auto Computed Final Price
            </span>
            <span className="text-lg font-bold text-[#F472B6] mt-0.5 block">
              ₹{finalPrice.toLocaleString()}
            </span>
          </div>

          {/* Associated Category select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#6B6B8A]">
              Associated Category <span className="text-[#EC4899] font-bold">*</span>
            </label>
            <FilterSelect
              value={formCategory}
              onChange={setFormCategory}
              options={formCategoryOptions}
              className={`w-full h-11 ${formErrors.category ? "border-[#EC4899] select-error" : ""}`}
            />
            {formErrors.category && (
              <span className="text-[10px] text-[#EC4899] font-bold">{formErrors.category}</span>
            )}
          </div>

          {/* Radio custom Service Type Cards (2x2 grid) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#6B6B8A]">
              Service Tier Class <span className="text-[#EC4899] font-bold">*</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Normal */}
              <div
                onClick={() => setFormType("Normal")}
                className={`border-2 rounded-[12px] p-3 cursor-pointer flex flex-col gap-1.5 transition-all select-none ${
                  formType === "Normal"
                    ? "border-[#F472B6] bg-[#FDF2F8]"
                    : "border-[#F9D0E8]/50 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${formType === "Normal" ? "text-[#F472B6]" : "text-[#A8A8C0]"}`} />
                  <span className="text-xs font-bold text-[#1A1A2E]">Normal</span>
                </div>
                <span className="text-[10px] text-[#6B6B8A] leading-normal">
                  Standard quality service mappings.
                </span>
              </div>

              {/* High */}
              <div
                onClick={() => setFormType("High")}
                className={`border-2 rounded-[12px] p-3 cursor-pointer flex flex-col gap-1.5 transition-all select-none ${
                  formType === "High"
                    ? "border-[#67C4C0] bg-[#E0F5F5]"
                    : "border-[#F9D0E8]/50 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${formType === "High" ? "text-[#3FA8A4]" : "text-[#A8A8C0]"}`} />
                  <span className="text-xs font-bold text-[#1A1A2E]">High</span>
                </div>
                <span className="text-[10px] text-[#6B6B8A] leading-normal">
                  Advanced muscle or skincare treatment.
                </span>
              </div>

              {/* VIP */}
              <div
                onClick={() => setFormType("VIP")}
                className={`border-2 rounded-[12px] p-3 cursor-pointer flex flex-col gap-1.5 transition-all select-none ${
                  formType === "VIP"
                    ? "border-[#F472B6] bg-[#FDF2F8]"
                    : "border-[#F9D0E8]/50 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Crown className={`w-4 h-4 ${formType === "VIP" ? "text-[#F472B6]" : "text-[#A8A8C0]"}`} />
                  <span className="text-xs font-bold text-[#1A1A2E]">VIP</span>
                </div>
                <span className="text-[10px] text-[#6B6B8A] leading-normal">
                  Premium aromatic soaks & private rooms.
                </span>
              </div>

              {/* VVIP */}
              <div
                onClick={() => setFormType("VVIP")}
                className={`border-2 rounded-[12px] p-3 cursor-pointer flex flex-col gap-1.5 transition-all select-none ${
                  formType === "VVIP"
                    ? "border-[#EC4899] bg-[#FCE7F3]/30"
                    : "border-[#F9D0E8]/50 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Gem className={`w-4 h-4 ${formType === "VVIP" ? "text-[#EC4899]" : "text-[#A8A8C0]"}`} />
                  <span className="text-xs font-bold text-[#1A1A2E]">VVIP</span>
                </div>
                <span className="text-[10px] text-[#6B6B8A] leading-normal">
                  Luxury 24k gold, collagen or full escaper rituals.
                </span>
              </div>
            </div>
          </div>

          {/* Active toggles */}
          <div className="flex items-center justify-between p-3 border border-[#F9D0E8]/60 bg-[#FDF2F8]/10 rounded-[12px] mt-2">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1A1A2E]">Publish Service Catalog</span>
              <span className="text-[10px] text-[#6B6B8A] mt-0.5">
                Make this active service discoverable in client apps.
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setFormIsActive(!formIsActive)}
              className={`w-9 h-5 rounded-full p-0.5 border-none transition-colors duration-150 flex items-center cursor-pointer ${
                formIsActive ? "bg-[#F472B6]" : "bg-[#F0F0F5]"
              }`}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-4 h-4 rounded-full bg-white shadow-md block"
                style={{ marginLeft: formIsActive ? "auto" : "0" }}
              />
            </button>
          </div>
        </form>
      </DrawerPanel>
    </div>
  );
};

export default Services;
