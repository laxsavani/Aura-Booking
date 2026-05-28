import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Mail,
  Phone,
  Cake,
  Globe,
  MapPin,
  Camera,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import Avatar from "../components/ui/Avatar";
import FilterSelect from "../components/ui/FilterSelect";
import api from "../api/axios";

export const Settings = () => {
  const { admin, token, login } = useAuth();
  const { addToast } = useToast();

  // Profile forms
  const [profileName, setProfileName] = useState(admin?.name || "");
  const [profileAge, setProfileAge] = useState(admin?.age?.toString() || "");
  const [profileGender, setProfileGender] = useState(admin?.gender || "female");
  const [profileMobile, setProfileMobile] = useState(admin?.mobileNumber || "");
  const [profileCountry, setProfileCountry] = useState(admin?.country || "India");
  const [profileState, setProfileState] = useState(admin?.state || "Gujarat");

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(admin?.profileImage || "");
  const fileInputRef = useRef(null);

  // Sync context admin info with state fields on load/change
  useEffect(() => {
    if (admin) {
      setProfileName(admin.name || "");
      setProfileAge(admin.age?.toString() || "");
      setProfileGender(admin.gender || "female");
      setProfileMobile(admin.mobileNumber || "");
      setProfileCountry(admin.country || "India");
      setProfileState(admin.state || "Gujarat");
      setProfilePreview(admin.profileImage || "");
    }
  }, [admin]);

  // Password forms
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast("Photo must be less than 5MB limit.", "warning");
        return;
      }
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // Update Profile API
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      addToast("Full name is required.", "warning");
      return;
    }

    setProfileLoading(true);

    const formData = new FormData();
    formData.append("name", profileName.trim());
    formData.append("age", profileAge || "30");
    formData.append("gender", profileGender);
    formData.append("mobileNumber", profileMobile.trim());
    formData.append("country", profileCountry.trim());
    formData.append("state", profileState.trim());
    if (profileFile) {
      formData.append("profileImage", profileFile);
    }

    try {
      addToast("Updating admin profile...", "info");
      const res = await api.put("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        const updatedUser = res.data.data.user;
        login(token, updatedUser); // Sync context and storage
        addToast("Profile updated successfully.", "success");
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // Change Password API
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      addToast("Please fill in all password fields.", "warning");
      return;
    }
    if (newPassword.length < 6) {
      addToast("New password must be at least 6 characters.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match.", "warning");
      return;
    }

    setPasswordLoading(true);

    // Note spelling conformPassword required by profile.controller.js
    const payload = {
      oldPassword,
      newPassword,
      conformPassword: confirmPassword
    };

    try {
      addToast("Changing password...", "info");
      const res = await api.put("/profile/change-password", payload);

      if (res.data?.success) {
        addToast("Password changed successfully.", "success");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to change password. Old password might be incorrect.", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-[#F9D0E8] pb-4 select-none">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-[#1A1A2E]">
            Account Settings
          </h2>
          <p className="text-xs text-[#6B6B8A] mt-1">
            Update your admin profile fields and secure credentials
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#FCE7F3] flex items-center justify-center text-[#F472B6] shadow-card">
          <SettingsIcon className="w-5 h-5 animate-spin-slow" />
        </div>
      </div>

      {/* Main Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Profile settings Form - 2/3 wide) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-[#F9D0E8] rounded-card p-6 shadow-card flex flex-col gap-5">
            <h3 className="text-base font-semibold text-[#1A1A2E] border-b border-[#F0F0F5] pb-3 select-none">
              Edit Admin Profile
            </h3>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
              {/* Photo uploader */}
              <div className="flex items-center gap-4 select-none mb-2">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar name={profileName} image={profilePreview} size={80} className="border border-[#F9D0E8]" />
                  <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-[#1A1A2E]">Profile Picture</span>
                  <span className="text-xs text-[#A8A8C0]">PNG or JPG format up to 5MB</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#F472B6] hover:text-[#EC4899] font-bold mt-1 bg-transparent border-none"
                  >
                    Change Photo
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Grid fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email (Read only) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#6B6B8A] select-none">
                    Email Address <span className="text-xs text-[#A8A8C0] font-medium">(Read-only)</span>
                  </label>
                  <div className="relative h-11">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A8C0]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={admin?.email || ""}
                      className="w-full h-full pl-10 pr-4 bg-[#F5F5F5] border border-[#F0F0F5] rounded-btn text-sm text-[#6B6B8A] cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#6B6B8A] select-none">
                    Full Name <span className="text-[#EC4899] font-bold">*</span>
                  </label>
                  <div className="relative h-11">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Admin Name"
                      className="w-full h-full pl-10 pr-4 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#6B6B8A] select-none">
                    Mobile Number
                  </label>
                  <div className="relative h-11">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={profileMobile}
                      onChange={(e) => setProfileMobile(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full h-full pl-10 pr-4 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#6B6B8A] select-none">
                    Age
                  </label>
                  <div className="relative h-11">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                      <Cake className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      value={profileAge}
                      onChange={(e) => setProfileAge(e.target.value)}
                      placeholder="35"
                      className="w-full h-full pl-10 pr-4 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none"
                    />
                  </div>
                </div>

                {/* State */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#6B6B8A] select-none">
                    State
                  </label>
                  <div className="relative h-11">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={profileState}
                      onChange={(e) => setProfileState(e.target.value)}
                      placeholder="Gujarat"
                      className="w-full h-full pl-10 pr-4 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#6B6B8A] select-none">
                    Country
                  </label>
                  <div className="relative h-11">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={profileCountry}
                      onChange={(e) => setProfileCountry(e.target.value)}
                      placeholder="India"
                      className="w-full h-full pl-10 pr-4 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5 md:col-span-2 select-none">
                  <label className="text-xs font-semibold text-[#6B6B8A]">
                    Gender Identity
                  </label>
                  <FilterSelect
                    value={profileGender}
                    onChange={setProfileGender}
                    options={[
                      { value: "female", label: "Female" },
                      { value: "male", label: "Male" },
                      { value: "other", label: "Other" }
                    ]}
                    className="w-full h-11"
                  />
                </div>
              </div>

              {/* Submit Profile */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={profileLoading}
                type="submit"
                className="h-11 mt-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-btn shadow-btn flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 border-none cursor-pointer"
              >
                {profileLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>Save Profile Changes</span>
              </motion.button>
            </form>
          </div>
        </div>

        {/* Right Column (Change Password Form - 1/3 wide) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="bg-white border border-[#F9D0E8] rounded-card p-5 shadow-card flex flex-col gap-4">
            <h3 className="text-base font-semibold text-[#1A1A2E] border-b border-[#F0F0F5] pb-3 select-none">
              Change Account Password
            </h3>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              {/* Old Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B6B8A] select-none">
                  Current Password <span className="text-[#EC4899] font-bold">*</span>
                </label>
                <div className="relative h-11">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showOldPass ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-full pl-10 pr-10 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A8C0] hover:text-[#F472B6] transition-colors border-none bg-transparent"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B6B8A] select-none">
                  New Password <span className="text-[#EC4899] font-bold">*</span>
                </label>
                <div className="relative h-11">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full h-full pl-10 pr-10 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A8C0] hover:text-[#F472B6] transition-colors border-none bg-transparent"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B6B8A] select-none">
                  Confirm New Password <span className="text-[#EC4899] font-bold">*</span>
                </label>
                <div className="relative h-11">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F472B6]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-full pl-10 pr-10 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] focus:border-[#F472B6] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A8C0] hover:text-[#F472B6] transition-colors border-none bg-transparent"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Password */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                disabled={passwordLoading}
                type="submit"
                className="h-11 mt-2 bg-primary-dark hover:bg-pink-700 text-white text-sm font-semibold rounded-btn shadow-btn flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 border-none cursor-pointer"
              >
                {passwordLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>Update Account Password</span>
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
