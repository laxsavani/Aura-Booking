import React from "react";

export const LoadingSkeleton = ({ type = "card", count = 1, className = "" }) => {
  const renderSkeleton = () => {
    if (type === "card") {
      return (
        <div
          className={`rounded-xl p-5 flex flex-col gap-4 ${className}`}
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3 shimmer-bg rounded-full w-1/3" />
              <div className="h-7 shimmer-bg rounded-full w-1/2" />
            </div>
            <div className="w-12 h-12 rounded-full shimmer-bg flex-shrink-0" />
          </div>
          <div className="h-3 shimmer-bg rounded-full w-2/3 mt-2" />
        </div>
      );
    }

    if (type === "row") {
      return (
        <div
          className={`flex items-center gap-4 py-3 ${className}`}
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <div className="w-10 h-10 rounded-full shimmer-bg flex-shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 shimmer-bg rounded-full w-1/4" />
            <div className="h-3 shimmer-bg rounded-full w-1/2" />
          </div>
          <div className="h-6 shimmer-bg rounded-full w-16" />
        </div>
      );
    }

    if (type === "block") {
      return (
        <div className={`shimmer-bg rounded-card ${className}`} />
      );
    }

    return null;
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};

export default LoadingSkeleton;
