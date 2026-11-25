"use client";

import Link from "next/link";
import { ListingMedia } from "@/types/listings";
import { cn } from "@/lib/utils";
import { DesignIcon } from "./DesignIcon";

export const salesButton = "inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg bg-[#F75803] px-3 text-[14px] font-medium tracking-[-0.2px] text-white shadow-[0_0_0_1px_#122B6914,0_1px_2px_#122B6914,0_2px_6px_#122B690A] transition-colors hover:bg-[#F75803] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F75803] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
export const salesOutlineButton = "inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#E4E4E4] bg-white px-3 text-[14px] text-[#5B5B5B] transition-colors hover:bg-[#F7F7F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F75803] disabled:cursor-not-allowed disabled:opacity-50";
export const salesInput = "h-10 w-full rounded-[10px] border border-[#E2E4E9] bg-white px-3 text-[14px] text-[#111810] shadow-[0_1px_2px_#00000005] outline-none placeholder:text-[#868C98] focus:border-[#F75803] focus:ring-1 focus:ring-[#F75803]";
export const salesPanel = "rounded-lg border border-[#E4E4E4] bg-white p-4";
export const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

export function SalesBackLink() {
  return <Link href="/listings" className="mb-0.5 flex w-fit items-center gap-2 text-[14px] leading-6 text-[#808080] hover:text-[#111810]"><DesignIcon name="back" size={16} />Back to products</Link>;
}

export function SalesSearch({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-[240px]">
      <DesignIcon name="search" size={20} className="pointer-events-none absolute left-2 top-1.5" />
      <input aria-label={placeholder} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-8 w-full rounded border border-[#F1F1F1] bg-[#F7F7F7] pl-9 pr-2 text-[14px] leading-6 outline-none placeholder:text-[#5B5B5B] focus:border-[#F75803]" />
    </div>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colors: Record<string, string> = { ACTIVE: "#2BAC47", ARCHIVED: "#808080", DRAFT: "#A4A4A4", PENDING: "#BF3100", PROCESSING: "#E08503", SHIPPED: "#007BFF", DELIVERED: "#2BAC47", CANCELLED: "#808080", "LOW STOCK": "#E08503", "OUT OF STOCK": "#C83532" };
  return <span className={cn("inline-flex whitespace-nowrap rounded px-2 py-1 text-[12px] font-medium leading-4 tracking-[0.06em] text-white", className)} style={{ backgroundColor: colors[status] || "#808080" }}>{status}</span>;
}

export function MediaPreview({ media, className, label }: { media?: ListingMedia; className?: string; label: string }) {
  return (
    <div className={cn("overflow-hidden rounded bg-[#E4E4E4]", className)}>
      {media?.type.startsWith("image/") ? <img src={media.url} alt={label} className="h-full w-full object-cover" />
        : media?.type.startsWith("video/") ? <video src={media.url} controls className="h-full w-full object-cover" aria-label={label} />
        : media ? <div className="flex h-full items-center justify-center gap-2 p-2 text-[#808080]"><DesignIcon name="report" size={24} color="#808080" /><span className="truncate text-xs">{media.name}</span></div> : <span className="sr-only">{label}</span>}
    </div>
  );
}

export function SalesPagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between gap-3 text-[14px] leading-5 text-[#373737]">
      <p className="font-medium tracking-[0.06em]">SHOWING {total ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, total)} OF {total.toLocaleString()}</p>
      <div className="flex gap-4">
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F7] text-[#111810] hover:bg-[#E4E4E4] disabled:cursor-not-allowed"><DesignIcon name="chevron-left" size={16} /></button>
        <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F7] text-[#111810] hover:bg-[#E4E4E4] disabled:cursor-not-allowed"><DesignIcon name="chevron-right" size={16} /></button>
      </div>
    </div>
  );
}
