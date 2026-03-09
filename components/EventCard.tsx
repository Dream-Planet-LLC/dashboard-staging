"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ban, MoreHorizontal, MoreHorizontalIcon, MoreVerticalIcon, StopCircle, Trash, Trash2Icon } from "lucide-react";
import { whiteProIcon } from "@/svg";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface EventCardProps {
  sessionName: string;
  creator: string;
  creatorAvatar?: string;
  status: "LIVE" | "UPCOMING" | "COMPLETED";
  viewers: string | number;
  revenue: number;
  date: string;
  eventImage?: string;
  onBanCreator?: () => void;
  onForceStop?: () => void;
  className?: string;
}

const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

// ────────────────────────────────────────────────
// EventCard Component
// ────────────────────────────────────────────────
export function EventCard({
  sessionName,
  creator,
  creatorAvatar,
  status,
  viewers,
  revenue,
  date,
  eventImage,
  onBanCreator,
  onForceStop,
  className = "",
}: EventCardProps) {
  // Determine status badge color
  let statusBgColor = "bg-[#C83532]"; // LIVE - Red
  if (status === "UPCOMING") statusBgColor = "bg-[#EF8943]"; // Orange
  if (status === "COMPLETED") statusBgColor = "bg-[#A4A4A4]"; // Gray

  return (
    <div
      className={`bg-white border border-[#EDEDED] md:w-[256px] w-full rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Event Image Section */}
      <div className="relative h-[144px] bg-gradient-to-br from-red-900 to-red-600">
        {/* Background Image */}
        {eventImage ? (
          <img
            src={eventImage}
            alt={sessionName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-4xl">🎤</span>
          </div>
        )}

        {/* Gradient Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Badge - Top Left */}
        <div className="absolute top-2 left-2 z-10">
          <span
            className={`px-[8px] py-[4px] ${statusBgColor} text-white text-[12px] font-medium INT500 rounded tracking-[6%] leading-[16px] uppercase`}
          >
            {status}
          </span>
        </div>

        {/* Creator Info - Bottom Left */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10">
          <Avatar className="h-[20px] w-[20px] border border-white/80">
            <AvatarImage src={creatorAvatar} />
            <AvatarFallback className="text-[10px] bg-gray-700 text-white">
              {creator[1]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-[14px] INT400 leading-[20px] drop-shadow-lg tracking-[-1.8%]">
            {creator}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 space-y-2">
        {/* Title and Date */}
        <div className="flex justify-between">
          <div>
            <h4 className="font-medium text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] truncate">
              {sessionName}
            </h4>
            <p className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              {date}
            </p>
          </div>

          {/* Actions Dropdown*/}
          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-6 w-6 p-0 text-[#373737] hover:bg-white/20 rounded"
                >
  <MoreHorizontal/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 space-y-2">
                {onBanCreator && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]"
                    onClick={onBanCreator}
                  >
                   {whiteProIcon}
                    Ban Creator
                  </DropdownMenuItem>
                )}
                {onForceStop && status === "LIVE" && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] leading-[20px] tracking-[-1.5%]"
                    onClick={onForceStop}
                  >
                   <Trash2Icon className="h-4 w-4" />
                    Force Stop
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats - Viewers and Revenue */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[#C8C8C8] INT500 text-[12px] leading-[16px] tracking-[6%] uppercase font-medium">
              VIEWERS
            </p>
            <p className="text-[#111810] INT500 text-[16px] leading-[24px] tracking-[-1.5%] font-medium">
              {typeof viewers === "number" ? viewers.toLocaleString() : viewers}
            </p>
          </div>
          <hr className="border-[#F1F1F1] h-[32px] border" />
          <div className="text-right">
            <p className="text-[#C8C8C8] INT500 text-[12px] leading-[16px] tracking-[6%] uppercase font-medium">
              REVENUE
            </p>
            <p className="text-[#111810] INT500 text-[16px] leading-[24px] tracking-[-1.5%] font-medium">
              {formatCurrency(revenue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
