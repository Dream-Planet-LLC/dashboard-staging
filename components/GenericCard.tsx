"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface CardAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface GenericCardProps {
  image?: string | null;
  title: string;
  subtitle?: string;
  description?: string;
  price?: string | number;
  badge?: string;
  metadata?: { label: string; value: string | number }[];
  actions?: CardAction[];
  imageAlt?: string;
  imagePlaceholder?: string;
  className?: string;
  onClick?: () => void;
}

// ────────────────────────────────────────────────
// Reusable Card Component
// ────────────────────────────────────────────────
export function GenericCard({
  image,
  title,
  subtitle,
  description,
  price,
  badge,
  metadata = [],
  actions = [],
  imageAlt = "Card image",
  imagePlaceholder = "?",
  className = "w-[256px]",
  onClick,
}: GenericCardProps) {
  const hasImage = image && image.trim() !== "";

  return (
    <div
      className={`bg-white border border-[#EDEDED] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {/* Image / Placeholder */}
      <div className="relative h-[144px] bg-gray-100">
        {hasImage ? (
          <img
            src={image!}
            alt={imageAlt}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
            {imagePlaceholder}
          </div>
        )}
        
        {/* Badge overlay (optional) */}
        {badge && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-[#F75803] text-white text-xs font-medium rounded">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-2">
        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] truncate flex-1">
            {title}
          </h4>

          {/* Actions Dropdown */}
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" className="h-8 w-8 p-0 ml-auto text-[#373737]">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 space-y-3">
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    className={`flex items-center gap-2 INT500 text-[14px] leading-[20px] tracking-[-1.5%] ${
                      action.variant === "destructive"
                        ? "text-[#C83532]"
                        : "text-[#373737]"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Subtitle / Description */}
        {(subtitle || description) && (
          <div className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
            {subtitle && <span>{subtitle}</span>}
            {subtitle && description && <span> • </span>}
            {description && <span>{description}</span>}
          </div>
        )}

        {/* Metadata rows */}
        {metadata.map((meta, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              {meta.label}
            </span>
            <span className="text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
              {meta.value}
            </span>
          </div>
        ))}

        {/* Price (if provided) */}
        {price !== undefined && (
          <div className="pt-2 border-t border-[#F1F1F1]">
            <span className="font-medium text-[#111810] INT500 text-[16px] leading-[24px] tracking-[-1.5%]">
              {typeof price === "number" ? `$${price.toLocaleString()}` : price}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}