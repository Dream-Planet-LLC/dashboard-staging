"use client";

interface SortButtonProps {
  label: string;
  direction: "asc" | "desc";
  onClick: () => void;
}

const SortButton = ({ label, direction, onClick }: SortButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Sort ${label} ${direction === "desc" ? "ascending" : "descending"}`}
    className="inline-flex items-center gap-1 text-left"
  >
    <span>{label}</span>
    <span aria-hidden="true" className="flex flex-col items-center gap-[1px]">
      <span
        className={`h-0 w-0 border-x-[3px] border-b-[4px] border-x-transparent ${
          direction === "asc" ? "border-b-[#5B5B5B]" : "border-b-[#B8B8B8]"
        }`}
      />
      <span
        className={`h-0 w-0 border-x-[3px] border-t-[4px] border-x-transparent ${
          direction === "desc" ? "border-t-[#5B5B5B]" : "border-t-[#B8B8B8]"
        }`}
      />
    </span>
  </button>
);

export default SortButton;
