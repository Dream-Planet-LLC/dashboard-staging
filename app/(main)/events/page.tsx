"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { EventCard } from "@/components/EventCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Ban, StopCircle, MoreHorizontalIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ListIcon,
  smSquareIcon,
  UpDown,
  WhiteListicon,
  whiteProIcon,
  WhitesmSquareIcon,
} from "@/svg";
import { DataView } from "@/components/Dataview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface Event {
  id: string;
  sessionName: string;
  creator: string;
  creatorAvatar?: string;
  status: "LIVE" | "UPCOMING" | "COMPLETED";
  viewers: string | number;
  revenue: number;
  date: string;
  eventImage?: string;
}

// ────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────
const mockEvents: Event[] = [
  {
    id: "1",
    sessionName: "Midnight Tour Dad Cap",
    creator: "@neonvibes",
    creatorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    status: "LIVE",
    viewers: 245,
    revenue: 8940,
    date: "19 Jan, 2026 at 19:00",
    eventImage:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
  },
  {
    id: "2",
    sessionName: "Midnight Tour Dad Cap",
    creator: "@neonvibes",
    creatorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    status: "LIVE",
    viewers: "8.2K",
    revenue: 1240,
    date: "19 Jan, 2026 at 19:00",
    eventImage:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
  },
  {
    id: "3",
    sessionName: "Midnight Tour Dad Cap",
    creator: "@neonvibes",
    creatorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    status: "LIVE",
    viewers: "114.9K",
    revenue: 71240,
    date: "19 Jan, 2026 at 19:00",
    eventImage:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
  },
  {
    id: "4",
    sessionName: "Midnight Tour Dad Cap",
    creator: "@neonvibes",
    creatorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    status: "LIVE",
    viewers: "3.1K",
    revenue: 12240,
    date: "19 Jan, 2026 at 19:00",
    eventImage:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
  },
  {
    id: "5",
    sessionName: "Midnight Tour Dad Cap",
    creator: "@neonvibes",
    creatorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    status: "UPCOMING",
    viewers: "17.6K",
    revenue: 18240,
    date: "19 Jan, 2026 at 19:00",
    eventImage:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
  },
  {
    id: "6",
    sessionName: "Midnight Tour Dad Cap",
    creator: "@neonvibes",
    creatorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    status: "COMPLETED",
    viewers: "9.9K",
    revenue: 1240,
    date: "19 Jan, 2026 at 19:00",
    eventImage:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
  },
];

const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 16;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // simulate API delay

    return () => clearTimeout(timer);
  }, []);

  // Filter events
  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.creator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalEvents = 12560; // Mock total

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-[#F75803] border-t-transparent rounded-full mx-auto" />
          <p className="text-[#808080]">Loading events...</p>
        </div>
      </div>
    );
  }

  if (!filteredEvents.length) {
    return (
      <div className="p-8 text-center text-[#808080]">No events available</div>
    );
  }

  // Define table columns
  const eventColumns: ColumnDef<Event>[] = [
    {
      accessorKey: "sessionName",
      header: "Session & Creator",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-[48px] w-[48px] rounded-[4px] overflow-hidden flex-shrink-0 bg-gray-200">
              {event.eventImage ? (
                <img
                  src={event.eventImage}
                  alt={event.sessionName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-medium text-gray-500">
                  E
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                {event.sessionName}
              </p>
              <p className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%] mt-[2px]">
                {event.creator}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let bgColor = "bg-[#C83532]";
        if (status === "UPCOMING") bgColor = "bg-[#EF8943]";
        if (status === "COMPLETED") bgColor = "bg-[#A4A4A4]";

        return (
          <div
            className={`inline-flex items-center px-[8px] py-[4px] rounded-[4px] text-[#FFFFFF] INT500 leading-[16px] tracking-[6%] text-[12px] font-medium ${bgColor}`}
          >
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "viewers",
      header: "Viewers",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {row.getValue("viewers")}
        </span>
      ),
    },
    {
      accessorKey: "revenue",
      header: () => (
        <div className="flex items-center gap-1">
          <span>Revenue</span>
       {UpDown}
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
          {formatCurrency(row.getValue("revenue"))}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: () => (
        <div className="flex items-center gap-1">
          <span>Date</span>
       {UpDown}
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {row.getValue("date")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className=" p-0 text-[#5B5B5B] hover:bg-white/20 rounded"
              >
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 space-y-2">
              <DropdownMenuItem className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
              {whiteProIcon}
                Ban Creator
              </DropdownMenuItem>

              <DropdownMenuItem className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                <Trash2Icon className="h-4 w-4" />
                Force Stop
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Render event card for grid view
  const renderEventCard = (event: Event) => {
    return (
      <EventCard
        sessionName={event.sessionName}
        creator={event.creator}
        creatorAvatar={event.creatorAvatar}
        status={event.status}
        viewers={event.viewers}
        revenue={event.revenue}
        date={event.date}
        eventImage={event.eventImage}
        onBanCreator={() => console.log("Ban creator", event.id)}
        onForceStop={() => console.log("Force stop event", event.id)}
      />
    );
  };

  const showingStart = (currentPage - 1) * pageSize + 1;
  const showingEnd = Math.min(
    Math.min(showingStart + pageSize - 1, totalEvents),
    showingStart + filteredEvents.length - 1,
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Events
        </h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
          Lorem ipsum dolor sit amet consectetur.
        </p>
      </div>

      {/* Search + Filter + View Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A4A4A4]" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#F1F1F1] focus-visible:ring-[#F75803] bg-[#F7F7F7]"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[101px] border-[#F1F1F1]">
              <SelectValue
                placeholder="All Status"
                className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
              />
            </SelectTrigger>
            <SelectContent className="w-[172px] mt-2 " >
              <SelectItem
                value="All Status"
                className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium"
              >
                All Status
              </SelectItem>
              <SelectItem
                value="LIVE"
                className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium"
              >
                LIVE
              </SelectItem>
              <SelectItem
                value="UPCOMING"
                className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium"
              >
                UPCOMING
              </SelectItem>
              <SelectItem
                value="COMPLETED"
                className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium"
              >
                COMPLETED
              </SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle Buttons */}
          <div className="flex rounded overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center justify-center h-[32px] w-[42px] transition-colors ${
                viewMode === "table"
                  ? "bg-[#F75803] text-white"
                  : "bg-[#F1F1F1] text-[#5B5B5B] hover:bg-[#FFEEE6]"
              }`}
            >
              {viewMode === "table" ? WhiteListicon : ListIcon}
            </button>
            <button
              onClick={() => setViewMode("grid")}
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
      </div>

      {/* DataView Component with external view control */}
      <DataView
        data={filteredEvents}
        columns={eventColumns}
        renderCard={renderEventCard}
        searchPlaceholder="Search events..."
        showViewToggle={false}
        externalViewMode={viewMode}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080] flex-1">
        <p className="INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          SHOWING {filteredEvents.length > 0 ? showingStart : 0}-
          {filteredEvents.length > 0 ? showingEnd : 0} OF{" "}
          {totalEvents.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <Image
              src="/icons/backbutton.svg"
              height={20}
              width={20}
              alt="previous"
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={showingEnd >= totalEvents}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <Image
              src="/icons/forwardbutton.svg"
              height={20}
              width={20}
              alt="next"
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
