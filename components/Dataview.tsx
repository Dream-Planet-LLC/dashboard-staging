"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UserTable } from "@/components/UserTable";
import { ListIcon, smSquareIcon, WhiteListicon, WhitesmSquareIcon } from "@/svg";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface DataViewProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  renderCard: (item: T) => React.ReactNode;
  searchPlaceholder?: string;
  defaultView?: "table" | "grid";
  showViewToggle?: boolean;
  gridClassName?: string;
  externalViewMode?: "table" | "grid"; // NEW: External control
}

// ────────────────────────────────────────────────
// Reusable DataView Component
// ────────────────────────────────────────────────
export function DataView<T>({
  data,
  columns,
  renderCard,
  searchPlaceholder = "Search...",
  defaultView = "table",
  showViewToggle = true,
  gridClassName = "flex flex-wrap gap-[27px]",
  externalViewMode, // NEW: Accept external view mode
}: DataViewProps<T>) {
  const [internalViewMode, setInternalViewMode] = useState<"table" | "grid">(defaultView);

  // Use external view mode if provided, otherwise use internal state
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode;

  // Update internal state when external mode changes
  useEffect(() => {
    if (externalViewMode !== undefined) {
      setInternalViewMode(externalViewMode);
    }
  }, [externalViewMode]);

  return (
    <div className="space-y-6">
      {/* View Toggle - Only show if enabled AND no external control */}
      {showViewToggle && externalViewMode === undefined && (
        <div className="flex justify-end">
          <div className="flex rounded overflow-hidden">
            <button
              onClick={() => setInternalViewMode("table")}
              className={`flex items-center justify-center h-[32px] w-[42px] transition-colors ${
                viewMode === "table"
                  ? "bg-[#F75803] text-white"
                  : "bg-[#F1F1F1] text-[#5B5B5B] hover:bg-[#FFEEE6]"
              }`}
            >
              {viewMode === "table" ? WhiteListicon : ListIcon}
            </button>
            <button
              onClick={() => setInternalViewMode("grid")}
              className={`flex items-center justify-center h-[32px] w-[42px] transition-colors ${
                viewMode === "grid"
                  ? "bg-[#F75803] text-white"
                  : "bg-[#F1F1F1] text-[#5B5B5B] hover:bg-[#FFEEE6]"
              }`}
            >
              {viewMode === "grid" ? WhitesmSquareIcon : smSquareIcon}
            </button>
          </div>
        </div>
      )}

      {/* Content - Table or Grid */}
      {viewMode === "table" ? (
        <div className="bg-white overflow-hidden">
          <UserTable
            data={data}
            columns={columns}
            placeholder={searchPlaceholder}
          />
        </div>
      ) : (
        <div className={gridClassName}>
          {data.map((item, index) => (
            <div key={index}>{renderCard(item)}</div>
          ))}
        </div>
      )}
    </div>
  );
}