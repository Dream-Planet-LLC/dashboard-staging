"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationFooterProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const PaginationFooter = ({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationFooterProps) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-xs font-medium tracking-[0.08em] text-[#909090]">
      <p>
        SHOWING {start}-{end} OF {total.toLocaleString()}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1 || total === 0}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F7] text-[#111810] transition hover:bg-[#EEEEEE] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="sr-only">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount || total === 0}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F7] text-[#111810] transition hover:bg-[#EEEEEE] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationFooter;
