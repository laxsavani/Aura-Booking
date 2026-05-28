import React from "react";
import { Search, X } from "lucide-react";

export const SearchInput = ({
  value = "",
  onChange,
  placeholder = "Search...",
  className = ""
}) => {
  return (
    <div className={`relative w-full max-w-[280px] h-10 ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-[#A8A8C0]" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-full pl-10 pr-9 bg-white border border-[#F9D0E8] rounded-pill text-sm text-[#1A1A2E] placeholder-[#A8A8C0] focus:border-[#F472B6] focus:outline-none focus:ring-4 focus:ring-[#F472B6]/15 transition-all duration-150"
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange && onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A8C0] hover:text-[#F472B6] transition-colors duration-150"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
