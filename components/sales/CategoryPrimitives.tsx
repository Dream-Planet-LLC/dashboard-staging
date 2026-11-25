"use client";

import { ListingMedia } from "@/types/listings";
import { DesignIcon } from "./DesignIcon";
import { cn } from "@/lib/utils";

export function CategoryIcon({ name, size = 20, color, className }: { name: string; size?: number; color?: string; className?: string }) {
  return <DesignIcon namespace="categories" name={name} size={size} color={color} className={className} />;
}

export const categoryPrimary = "inline-flex h-8 items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-[#F75803] px-3 text-[14px] font-medium leading-5 tracking-[-0.015em] text-white shadow-[0_0_0_1px_#122B6914,0_1px_2px_#122B6914,0_2px_6px_#122B690A] outline-none focus-visible:ring-2 focus-visible:ring-[#F75803] focus-visible:ring-offset-2 disabled:opacity-50";
export const categoryOutline = "inline-flex h-8 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-[#E4E4E4] bg-white px-3 text-[14px] font-medium leading-5 tracking-[-0.015em] text-[#5B5B5B] outline-none hover:bg-[#F7F7F7] focus-visible:ring-2 focus-visible:ring-[#F75803] disabled:opacity-50";
export const categoryTab = "relative h-[41px] rounded-none bg-transparent px-0 pb-4 pt-0 text-[16px] font-medium leading-6 tracking-[-0.015em] text-[#A4A4A4] shadow-none data-[state=active]:bg-transparent data-[state=active]:text-[#111810] data-[state=active]:shadow-none after:absolute after:bottom-[-1px] after:left-0 after:h-px after:w-[calc(100%+17px)] data-[state=active]:after:bg-[#F75803]";

export function CategoryMedia({ media, label, className }: { media?: ListingMedia; label: string; className?: string }) {
  return <div className={cn("overflow-hidden rounded bg-[#D9D9D9]", className)}>{media && <img src={media.url} alt={label} className="h-full w-full object-cover" />}</div>;
}

export function CategorySearch({ value, onChange, placeholder = "Search...", label = "Search categories", className }: { value: string; onChange: (value: string) => void; placeholder?: string; label?: string; className?: string }) {
  return <div className={cn("relative w-full sm:w-[272px]", className)}><CategoryIcon name="search" size={20} className="pointer-events-none absolute left-2 top-1.5" /><input aria-label={label} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} className="h-8 w-full rounded border border-[#F1F1F1] bg-[#F7F7F7] pl-9 pr-2 text-[14px] leading-6 tracking-[-0.018em] text-[#111810] outline-none placeholder:text-[#5B5B5B] focus-visible:border-[#F75803]" /></div>;
}
