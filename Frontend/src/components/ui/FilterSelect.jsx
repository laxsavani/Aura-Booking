import React from "react";
import { ChevronDown } from "lucide-react";

export const FilterSelect = ({
  value = "",
  onChange,
  options = [],
  label,
  className = ""
}) => {
  return (
    <div className={`relative h-10 min-w-[140px] ${className}`}>
      {label && (
        <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-semibold text-[#6B6B8A] z-10 select-none">
          {label}
        </span>
      )}
      
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full h-full pl-3.5 pr-9 bg-white border border-[#F9D0E8] rounded-btn text-sm text-[#1A1A2E] appearance-none focus:border-[#F472B6] focus:outline-none focus:ring-4 focus:ring-[#F472B6]/10 transition-all duration-150 cursor-pointer"
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Chevron Overlay */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#A8A8C0]">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
};

export default FilterSelect;
