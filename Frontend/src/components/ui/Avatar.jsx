import React from "react";

export const Avatar = ({ name = "", image = "", size = 40, className = "" }) => {
  // Size mapper
  const sizeClasses = {
    32: "w-8 h-8 text-xs",
    36: "w-9 h-9 text-xs",
    40: "w-10 h-10 text-sm",
    48: "w-12 h-12 text-base",
    56: "w-14 h-14 text-lg",
    80: "w-20 h-20 text-2xl"
  };

  const selectedSizeClass = sizeClasses[size] || "w-10 h-10 text-sm";

  // Initials generator
  const getInitials = (userName) => {
    if (!userName) return "AU";
    const cleaned = userName.trim().replace(/\s+/g, " ");
    const parts = cleaned.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`relative rounded-full flex items-center justify-center flex-shrink-0 select-none overflow-hidden ${selectedSizeClass} ${className}`}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <div className="w-full h-full bg-[#FCE7F3] text-[#F472B6] font-semibold flex items-center justify-center">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
