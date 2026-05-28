import React from "react";

export const StatusBadge = ({ status = "Pending", size = "sm" }) => {
  const normalizedStatus = status.trim().charAt(0).toUpperCase() + status.trim().slice(1).toLowerCase();

  let bgClass = "bg-[#FCE7F3] text-[#F472B6]";
  let dotClass = "pulse-dot-pink bg-[#F472B6]";
  let hasDot = true;

  if (normalizedStatus === "Approved" || normalizedStatus === "Active") {
    bgClass = "bg-[#E0F5F5] text-[#3FA8A4]";
    dotClass = "pulse-dot-teal bg-[#67C4C0]";
  } else if (normalizedStatus === "Rejected" || normalizedStatus === "Inactive") {
    bgClass = "bg-[#FCE7F3] text-[#EC4899]";
    dotClass = "bg-[#EC4899]"; // solid dot
  } else if (normalizedStatus === "Cancelled") {
    bgClass = "bg-[#FDF2F8]/60 text-[#A8A8C0]";
    dotClass = "bg-[#A8A8C0]"; // solid dot
  } else {
    // Default to Pending style (pink)
    bgClass = "bg-[#FDF2F8] text-[#F472B6]";
    dotClass = "pulse-dot-pink bg-[#F472B6]";
  }

  const paddingClass = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-[13px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-pill border border-transparent select-none w-max ${paddingClass} ${bgClass}`}
    >
      {hasDot && <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
      {normalizedStatus}
    </span>
  );
};

export default StatusBadge;
