import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Plus,
  Search,
  Pencil,
  Trash2,
  Sparkles,
  Layers,
  Flame,
  Award,
  Clock,
  XCircle,
  FolderOpen
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import ConfirmModal from "../components/ui/ConfirmModal";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import api from "../api/axios";

export const Categories = () => {
  const { addToast } = useToast();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("trending"); // trending, popular, recent, all
  const [formDescription, setFormDescription] = useState("");

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/home/category");
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to retrieve categories catalog.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Check if routed with request to open the add modal (from Quick Actions)
  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenAddModal();
      // Clear location state to prevent reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Filter Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = cat.name?.toLowerCase().includes(q);
      const descMatch = cat.description?.toLowerCase().includes(q);
      const searchOk = !q || nameMatch || descMatch;

      // In the backend schema/seed, type might be capitalized or matches direct category names.
      // We will normalize type checks for filtering.
      const normalizedType = cat.type?.toLowerCase() || "all";
      let typeMatch = true;
      if (selectedTypeFilter !== "All") {
        typeMatch = normalizedType.includes(selectedTypeFilter.toLowerCase());
      }

      return searchOk && typeMatch;
    });
  }, [categories, searchQuery, selectedTypeFilter]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedCategoryId(null);
    setFormName("");
    setFormType("trending");
    setFormDescription("");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setModalMode("edit");
    setSelectedCategoryId(cat._id);
    setFormName(cat.name);
    // Normalize type for editing select value match
    let normType = cat.type?.toLowerCase() || "all";
    if (normType.includes("massage")) normType = "trending";
    else if (normType.includes("facial")) normType = "popular";
    else if (normType.includes("body")) normType = "recent";
    setFormType(normType);
    setFormDescription(cat.description || "");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formName.trim()) {
      errors.name = "Category name is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaveLoading(true);

    // Map system-defined classification types as per backend expectations or UI definitions
    let mappedType = "Massage Therapies";
    if (formType === "popular") mappedType = "Facials & Skincare";
    else if (formType === "recent") mappedType = "Body Treatments";
    else if (formType === "all") mappedType = "Nail Care";

    const payload = {
      name: formName.trim(),
      type: mappedType,
      description: formDescription.trim() || `${formName} spa relaxation therapies.`
    };

    try {
      if (modalMode === "add") {
        addToast("Adding category...", "info");
        const res = await api.post("/home/add-category", payload);
        if (res.data?.success) {
          addToast("Category created successfully.", "success");
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        addToast("Updating category...", "info");
        const res = await api.put(`/home/update-category/${selectedCategoryId}`, payload);
        if (res.data?.success) {
          addToast("Category updated successfully.", "success");
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to save category.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenDeleteModal = (cat, e) => {
    e.stopPropagation();
    setDeleteTargetId(cat._id);
    setDeleteTargetName(cat.name);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    // Optimistic Update
    setCategories(prev => prev.filter(c => c._id !== deleteTargetId));
    setShowDeleteModal(false);

    try {
      addToast("Deleting category...", "info");
      const res = await api.delete(`/home/delete-category/${deleteTargetId}`);
      if (res.data?.success) {
        addToast("Category removed successfully.", "success");
        fetchCategories();
      } else {
        fetchCategories();
        addToast("Failed to delete category.", "error");
      }
    } catch (err) {
      fetchCategories();
      addToast(err.response?.data?.message || "Error deleting category.", "error");
    } finally {
      setDeleteTargetId(null);
      setDeleteTargetName("");
    }
  };

  // Icon selector based on type/name
  const getCategoryIcon = (type = "") => {
    const t = type.toLowerCase();
    if (t.includes("massage") || t.includes("trend")) return Flame;
    if (t.includes("facial") || t.includes("popular")) return Award;
    if (t.includes("body") || t.includes("recent")) return Clock;
    return Layers;
  };

  const getGradientClass = (type = "") => {
    const t = type.toLowerCase();
    if (t.includes("massage") || t === "trending") return "from-[#F472B6] to-[#EC4899]";
    if (t.includes("facial") || t === "popular") return "from-[#67C4C0] to-[#3FA8A4]";
    if (t.includes("body") || t === "recent") return "from-[#F472B6] to-[#67C4C0]";
    return "from-[#1A1A2E] to-[#3FA8A4]";
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-[#F9D0E8] pb-4 select-none">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-[#1A1A2E]">
            Categories Catalog
          </h2>
          <p className="text-xs text-[#6B6B8A] mt-1">
            Manage service categories and classifications
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 6px 24px rgba(244,114,182,0.30)" }}
          whileTap={{ scale: 0.96 }}
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F472B6] hover:bg-[#EC4899] text-white text-sm font-semibold rounded-btn shadow-btn transition-colors border-none"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Category</span>
        </motion.button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#F9D0E8] rounded-card p-4 shadow-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories..."
          className="w-full md:max-w-[280px]"
        />

        <FilterSelect
          value={selectedTypeFilter}
          onChange={setSelectedTypeFilter}
          options={[
            { value: "All", label: "All Classifications" },
            { value: "trending", label: "Trending" },
            { value: "popular", label: "Popular" },
            { value: "recent", label: "Recent" },
            { value: "all", label: "General" }
          ]}
          label="Classification"
          className="self-end md:self-center"
        />
      </div>

      {/* Categories Grid */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <LoadingSkeleton type="card" count={6} />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white border border-[#F9D0E8] rounded-card p-12 text-center shadow-card flex items-center justify-center">
            <div className="max-w-md flex flex-col items-center gap-2">
              <FolderOpen className="w-12 h-12 text-[#A8A8C0]" />
              <h3 className="text-base font-semibold text-[#1A1A2E] mt-3">No categories found</h3>
              <p className="text-xs text-[#6B6B8A] leading-normal">
                Adjust search query filters to display matching groups.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredCategories.map((cat, idx) => {
              // Normalize type string
              let displayType = "Trending";
              let typeColor = "trending";
              const rawType = cat.type?.toLowerCase() || "";
              if (rawType.includes("massage")) {
                displayType = "Trending";
                typeColor = "trending";
              } else if (rawType.includes("facial")) {
                displayType = "Popular";
                typeColor = "popular";
              } else if (rawType.includes("body")) {
                displayType = "Recent";
                typeColor = "recent";
              } else {
                displayType = "All";
                typeColor = "all";
              }

              const Icon = getCategoryIcon(typeColor);
              const gradClass = getGradientClass(typeColor);
              const srvCount = cat.services?.length || 0;

              return (
                <motion.div
                  key={cat._id}
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(244,114,182,0.18)" }}
                  className="bg-white border border-[#F9D0E8] rounded-card p-5 shadow-card flex flex-col justify-between h-56"
                >
                  <div className="flex flex-col gap-3">
                    {/* Top Row Icon + Classification Badge */}
                    <div className="flex justify-between items-center select-none">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradClass} flex items-center justify-center text-white shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider bg-[#FCE7F3] text-[#F472B6]">
                        {displayType}
                      </span>
                    </div>

                    {/* Name & Desc */}
                    <div className="flex flex-col gap-1 mt-1">
                      <h4 className="text-base font-bold text-[#1A1A2E] truncate">{cat.name}</h4>
                      <p className="text-[11px] text-[#6B6B8A] leading-relaxed line-clamp-2">
                        {cat.description || "Service group details catalog."}
                      </p>
                    </div>
                  </div>

                  {/* Lower Row Services Count + Actions */}
                  <div className="flex items-center justify-between border-t border-[#F0F0F5] pt-3 mt-2 select-none">
                    <div className="flex items-center gap-1 text-xs text-[#6B6B8A] font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
                      <span>{srvCount} Services</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1 border border-[#F9D0E8] text-[#F472B6] hover:bg-[#FDF2F8] rounded transition-colors"
                        title="Edit Category Name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleOpenDeleteModal(cat, e)}
                        className="p-1 bg-[#FCE7F3] text-[#EC4899] rounded transition-colors border-none"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Delete Modal Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTargetId(null);
          setDeleteTargetName("");
        }}
        title="Delete Category?"
        message={`Are you sure you want to permanently delete category "${deleteTargetName}"? This action declines related services catalog filters.`}
        confirmText="Delete"
        danger={true}
      />

      {/* Inline Small Modal (max-width 440px) */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm z-[990] cursor-pointer"
            />

            {/* Central Modal Card */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[999] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 28 } }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                className="bg-white border border-[#F9D0E8] rounded-[20px] p-7 w-full max-w-[440px] shadow-card-hover pointer-events-auto flex flex-col gap-5"
              >
                <div>
                  <h3 className="text-[19px] font-display font-semibold text-[#1A1A2E]">
                    {modalMode === "add" ? "Create Category" : "Edit Category Group"}
                  </h3>
                  <p className="text-[11px] text-[#6B6B8A] mt-0.5">
                    Configure classifications and names for client filters
                  </p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSaveCategory}>
                  {/* Category Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#6B6B8A] px-0.5">
                      Category Name <span className="text-[#EC4899] font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Facials & Skincare"
                      className={`w-full h-11 px-3.5 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none ${
                        formErrors.name ? "border-[#EC4899]" : ""
                      }`}
                    />
                    {formErrors.name && (
                      <span className="text-[10px] text-[#EC4899] font-bold">{formErrors.name}</span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#6B6B8A] px-0.5">
                      Description / Details
                    </label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="e.g. Clean peels and deep skincare."
                      className="w-full h-11 px-3.5 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none"
                    />
                  </div>

                  {/* Type/Classification Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#6B6B8A] px-0.5">
                      Classification Type
                    </label>
                    <FilterSelect
                      value={formType}
                      onChange={setFormType}
                      options={[
                        { value: "trending", label: "Trending" },
                        { value: "popular", label: "Popular" },
                        { value: "recent", label: "Recent" },
                        { value: "all", label: "General" }
                      ]}
                      className="w-full h-11"
                    />
                  </div>
                </form>

                {/* Live Preview Card */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#A8A8C0] uppercase font-bold tracking-wider px-0.5">
                    Live Aesthetic Card Preview
                  </span>
                  
                  <div className="bg-white border border-[#F9D0E8] rounded-card p-4 flex flex-col justify-between h-36 select-none shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradientClass(formType)} flex items-center justify-center text-white`}>
                        {React.createElement(getCategoryIcon(formType), { className: "w-4 h-4" })}
                      </div>
                      <span className="px-2 py-0.5 rounded-pill text-[9px] font-bold uppercase tracking-wider bg-[#FCE7F3] text-[#F472B6]">
                        {formType.charAt(0).toUpperCase() + formType.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 mt-2">
                      <span className="text-sm font-bold text-[#1A1A2E] truncate">
                        {formName || "Untitled Category"}
                      </span>
                      <span className="text-[10px] text-[#6B6B8A] leading-normal truncate">
                        {formDescription || "Service details catalog group description."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-11 border border-[#F9D0E8] text-[#F472B6] hover:bg-[#FDF2F8] text-sm font-semibold rounded-btn transition-colors border-none cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    disabled={saveLoading}
                    onClick={handleSaveCategory}
                    className="flex-1 h-11 bg-[#F472B6] hover:bg-[#EC4899] text-white text-sm font-semibold rounded-btn shadow-btn flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 border-none cursor-pointer"
                  >
                    {saveLoading && (
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    <span>Save Group</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
