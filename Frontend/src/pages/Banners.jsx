import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Pencil,
  UploadCloud,
  X,
  Link2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "../hooks/useToast";
import ConfirmModal from "../components/ui/ConfirmModal";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import api from "../api/axios";

export const Banners = () => {
  const { addToast } = useToast();
  
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedBannerId, setSelectedBannerId] = useState(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formFile, setFormFile] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState("");

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/banners/admin");
      if (res.data?.success) {
        setBanners(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to retrieve promotional banners.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenAddModal = () => {
    if (banners.length >= 5) {
      addToast("Maximum banner limit of 5 reached.", "error");
      return;
    }
    setModalMode("add");
    setSelectedBannerId(null);
    setFormTitle("");
    setFormDescription("");
    setFormLink("");
    setFormIsActive(true);
    setFormFile(null);
    setFormImagePreview("");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setModalMode("edit");
    setSelectedBannerId(banner._id);
    setFormTitle(banner.title || "");
    setFormDescription(banner.description || "");
    setFormLink(banner.link || "");
    setFormIsActive(banner.isActive);
    setFormFile(null);
    setFormImagePreview(banner.image);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Image file select changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, photo: "File size exceeds 5MB limit." }));
        return;
      }
      setFormFile(file);
      setFormImagePreview(URL.createObjectURL(file));
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy.photo;
        return copy;
      });
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
        setFormErrors(prev => ({ ...prev, photo: "File size exceeds 5MB limit." }));
        return;
      }
      setFormFile(file);
      setFormImagePreview(URL.createObjectURL(file));
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy.photo;
        return copy;
      });
    }
  };

  const handleRemoveImage = () => {
    setFormFile(null);
    setFormImagePreview("");
  };

  const validateForm = () => {
    const errors = {};
    if (modalMode === "add" && !formFile) {
      errors.photo = "Banner photo file is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaveLoading(true);

    const formData = new FormData();
    formData.append("title", formTitle.trim());
    formData.append("description", formDescription.trim());
    formData.append("link", formLink.trim());
    formData.append("isActive", formIsActive);
    if (formFile) {
      formData.append("banner", formFile);
    }

    try {
      if (modalMode === "add") {
        addToast("Uploading banner to Cloudinary...", "info");
        const res = await api.post("/banners", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data?.success) {
          addToast("Banner created successfully.", "success");
          setIsModalOpen(false);
          fetchBanners();
        }
      } else {
        addToast("Updating banner details...", "info");
        const res = await api.put(`/banners/${selectedBannerId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data?.success) {
          addToast("Banner updated successfully.", "success");
          setIsModalOpen(false);
          fetchBanners();
        }
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to save banner.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  // Toggle active status directly from card
  const handleToggleActive = async (banner, e) => {
    e.stopPropagation();
    const newStatus = !banner.isActive;

    // Optimistic Update
    setBanners(prev =>
      prev.map(b => (b._id === banner._id ? { ...b, isActive: newStatus } : b))
    );

    try {
      const res = await api.put(`/banners/${banner._id}`, { isActive: newStatus });
      if (res.data?.success) {
        addToast(`Banner visibility toggled.`, "success");
      } else {
        fetchBanners();
        addToast("Failed to toggle status.", "error");
      }
    } catch (err) {
      fetchBanners();
      addToast("Failed to communicate update.", "error");
    }
  };

  const handleOpenDeleteModal = (banner, e) => {
    e.stopPropagation();
    setDeleteTargetId(banner._id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    // Optimistic Update
    setBanners(prev => prev.filter(b => b._id !== deleteTargetId));
    setShowDeleteModal(false);

    try {
      addToast("Deleting banner...", "info");
      const res = await api.delete(`/banners/${deleteTargetId}`);
      if (res.data?.success) {
        addToast("Banner removed successfully.", "success");
        fetchBanners();
      } else {
        fetchBanners();
        addToast("Failed to delete banner.", "error");
      }
    } catch (err) {
      fetchBanners();
      addToast(err.response?.data?.message || "Error deleting banner.", "error");
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-[#F9D0E8] pb-4 select-none">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-[#1A1A2E]">
            Promotional Banners
          </h2>
          <p className="text-xs text-[#6B6B8A] mt-1">
            Manage mobile app home screen banner announcements (Limit: 5 active/inactive banners)
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Banner Count Indicator */}
          <div className="text-xs font-bold text-[#6B6B8A] bg-white border border-[#F9D0E8] rounded-btn px-3 py-2 shadow-sm">
            Banners: <span className={banners.length >= 5 ? "text-[#EC4899]" : "text-[#3FA8A4]"}>{banners.length}</span> / 5
          </div>

          <motion.button
            whileHover={banners.length < 5 ? { scale: 1.02, boxShadow: "0 6px 24px rgba(244,114,182,0.30)" } : {}}
            whileTap={banners.length < 5 ? { scale: 0.96 } : {}}
            disabled={banners.length >= 5}
            onClick={handleOpenAddModal}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-btn shadow-btn transition-colors border-none cursor-pointer ${
              banners.length >= 5
                ? "bg-[#E0E0E8] text-[#A8A8C0] cursor-not-allowed shadow-none"
                : "bg-[#F472B6] hover:bg-[#EC4899] text-white"
            }`}
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Banner</span>
          </motion.button>
        </div>
      </div>

      {/* Warning Alert if Limit Reached */}
      {banners.length >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 text-amber-800 rounded-card p-4 flex gap-3 items-center select-none shadow-sm"
        >
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="text-xs font-medium">
            <strong>Maximum banner limit reached (5/5).</strong> To upload a new app banner advertisement, you must first delete one of the existing banners below.
          </div>
        </motion.div>
      )}

      {/* Banners Grid */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white border border-[#F9D0E8] rounded-card p-12 text-center shadow-card flex items-center justify-center">
            <div className="max-w-md flex flex-col items-center gap-2">
              <ImageIcon className="w-12 h-12 text-[#A8A8C0] animate-bounce" />
              <h3 className="text-base font-semibold text-[#1A1A2E] mt-3">No banners found</h3>
              <p className="text-xs text-[#6B6B8A] leading-normal">
                Upload eye-catching banners to promote special offers or new services on the mobile app home screen.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenAddModal}
                className="mt-3 px-4 py-2 bg-[#F472B6] hover:bg-[#EC4899] text-white text-xs font-semibold rounded-btn border-none cursor-pointer"
              >
                Create First Banner
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(244,114,182,0.15)" }}
                className="bg-white border border-[#F9D0E8] rounded-card overflow-hidden shadow-card relative group flex flex-col justify-between"
              >
                {/* Visual Image Section */}
                <div className="aspect-video w-full bg-slate-100 relative overflow-hidden select-none">
                  <img
                    src={banner.image}
                    alt={banner.title || "Promotional banner"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase tracking-wider shadow-sm select-none ${
                      banner.isActive
                        ? "bg-[#E0F5F5] text-[#3FA8A4]"
                        : "bg-gray-150 text-[#6B6B8A]"
                    }`}>
                      {banner.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-[#1A1A2E] text-sm truncate">
                      {banner.title || <em className="text-[#A8A8C0] font-normal">Untitled Banner</em>}
                    </h3>
                    <p className="text-[11px] text-[#6B6B8A] leading-relaxed line-clamp-2">
                      {banner.description || "No promotional details provided."}
                    </p>
                    {banner.link && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#3FA8A4] font-semibold bg-[#E0F5F5]/65 rounded-pill px-2.5 py-1 w-fit max-w-full">
                        <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{banner.link}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Toggles Row */}
                  <div className="flex items-center justify-between border-t border-[#F0F0F5] pt-3 select-none">
                    {/* Active Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleActive(banner, e)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors border-none cursor-pointer flex items-center ${
                          banner.isActive ? "bg-[#F472B6]" : "bg-[#F0F0F5]"
                        }`}
                        title={banner.isActive ? "Disable Banner" : "Enable Banner"}
                      >
                        <motion.span
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-4 h-4 rounded-full bg-white shadow-md block"
                          style={{ marginLeft: banner.isActive ? "auto" : "0" }}
                        />
                      </button>
                      <span className="text-[10px] text-[#6B6B8A] font-semibold">
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Edit/Delete Buttons */}
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenEditModal(banner)}
                        className="p-1.5 border border-[#F9D0E8] text-[#F472B6] hover:bg-[#FDF2F8] rounded transition-colors cursor-pointer"
                        title="Edit Banner details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleOpenDeleteModal(banner, e)}
                        className="p-1.5 bg-[#FCE7F3] text-[#EC4899] rounded transition-colors border-none cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
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
        }}
        title="Delete Banner?"
        message="Are you sure you want to permanently delete this banner? This deletes the image from Cloudinary storage and removes it from the mobile app."
        confirmText="Delete"
        danger={true}
      />

      {/* Form Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm z-[990] cursor-pointer"
            />

            {/* Modal Box */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[999] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 28 } }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                className="bg-white border border-[#F9D0E8] rounded-[20px] p-6 w-full max-w-[460px] shadow-card-hover pointer-events-auto flex flex-col gap-4 overflow-y-auto max-h-[90vh]"
              >
                <div>
                  <h3 className="text-[19px] font-display font-semibold text-[#1A1A2E]">
                    {modalMode === "add" ? "Create Promotional Banner" : "Edit Banner Details"}
                  </h3>
                  <p className="text-[11px] text-[#6B6B8A] mt-0.5">
                    Configure titles, action URLs, and upload banner graphics.
                  </p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSaveBanner}>
                  {/* Banner Image Drag zone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#6B6B8A] px-0.5">
                      Banner Graphic (16:9) <span className="text-[#EC4899] font-bold">*</span>
                    </label>

                    {formImagePreview ? (
                      <div className="relative w-full aspect-video rounded-card overflow-hidden border border-[#F9D0E8] select-none shadow-sm">
                        <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors border-none cursor-pointer"
                          title="Remove Image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full aspect-video rounded-card border-2 border-dashed border-[#F9D0E8] hover:border-[#F472B6] hover:bg-[#FDF2F8]/40 transition-all duration-150 flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center ${
                          formErrors.photo ? "border-[#EC4899] bg-[#FCE7F3]/10" : ""
                        }`}
                      >
                        <UploadCloud className="w-8 h-8 text-[#F472B6] animate-pulse" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-[#1A1A2E]">
                            Drag & drop or click to upload banner image
                          </span>
                          <span className="text-[9px] text-[#A8A8C0]">
                            JPG, PNG, WEBP up to 5MB (Recom: 16:9 ratio)
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

                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#6B6B8A] px-0.5">
                      Banner Title <span className="text-xs text-[#A8A8C0] font-medium">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Flat 30% Off This Weekend"
                      className="w-full h-11 px-3.5 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#6B6B8A] px-0.5">
                      Promo Description <span className="text-xs text-[#A8A8C0] font-medium">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="e.g. Use coupon code SPA30 at checkout."
                      className="w-full h-11 px-3.5 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none"
                    />
                  </div>

                  {/* Link Redirect */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#6B6B8A] px-0.5">
                      Redirect Link / URL <span className="text-xs text-[#A8A8C0] font-medium">(Optional)</span>
                    </label>
                    <div className="relative h-11">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A8C0]">
                        <Link2 className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={formLink}
                        onChange={(e) => setFormLink(e.target.value)}
                        placeholder="e.g. https://aura-booking.com/services"
                        className="w-full h-full pl-9 pr-3.5 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="flex items-center justify-between p-3 border border-[#F9D0E8]/60 bg-[#FDF2F8]/10 rounded-[12px] select-none">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1A1A2E]">Publish Banner</span>
                      <span className="text-[10px] text-[#6B6B8A] mt-0.5">
                        Set active to show on the app dashboard right away.
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

                {/* Footer buttons */}
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
                    onClick={handleSaveBanner}
                    className="flex-1 h-11 bg-[#F472B6] hover:bg-[#EC4899] text-white text-sm font-semibold rounded-btn shadow-btn flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 border-none cursor-pointer"
                  >
                    {saveLoading && (
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    <span>Save Banner</span>
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

export default Banners;
