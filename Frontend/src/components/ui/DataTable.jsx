import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import EmptyState from "./EmptyState";

export const DataTable = ({
  columns = [],
  rows = [],
  loading = false,
  onRowClick
}) => {
  const containerVariants = {
    animate: { transition: { staggerChildren: 0.04 } }
  };

  const rowVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } }
  };

  return (
    <div
      className="overflow-hidden w-full rounded-xl"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)"
      }}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr style={{ backgroundColor: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`text-[11px] uppercase font-semibold tracking-wider px-5 py-3.5 select-none ${col.className || ""}`}
                  style={{ color: "var(--hint)" }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <motion.tbody variants={containerVariants} initial="initial" animate="animate">
            {loading ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: "1px solid var(--border-light)", height: "58px" }}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-4 shimmer-bg rounded-full w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center">
                  <EmptyState
                    icon={Calendar}
                    title="No records found"
                    subtitle="There is no data matching your query."
                  />
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <motion.tr
                  key={row.id || row._id || rIdx}
                  variants={rowVariants}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? "cursor-pointer" : ""}
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                  onMouseEnter={e => { if (onRowClick) e.currentTarget.style.backgroundColor = "var(--bg)"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {columns.map((col, cIdx) => {
                    const value = col.render ? col.render(row, rIdx) : row[col.field];
                    return (
                      <td
                        key={cIdx}
                        className={`text-sm px-5 py-4 ${col.className || ""}`}
                        style={{ color: "var(--text)" }}
                      >
                        {value}
                      </td>
                    );
                  })}
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
