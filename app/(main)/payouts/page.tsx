"use client";

import LoadingState from "@/components/LoadingState";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UserTable } from "@/components/UserTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { salRevIcon } from "@/svg";
import {
  fetchPayoutsData,
  Payout,
  PayoutStats,
  PayoutsPagination,
} from "@/lib/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

// ────────────────────────────────────────────────
const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

const formatDate = (dateValue?: string) => {
  if (!dateValue) return "Unknown";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
      hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCompactNumber = (num: number): string => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum < 1000) {
    return sign + absNum.toString();
  } else if (absNum < 1_000_000) {
    const value = absNum / 1000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "K";
  } else if (absNum < 1_000_000_000) {
    const value = absNum / 1_000_000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "M";
  } else {
    const value = absNum / 1_000_000_000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "B";
  }
};

const PayoutsPage = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [pagination, setPagination] = useState<PayoutsPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const totalPayouts = pagination?.totalDocs || 0;

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        // Only show loader on initial load
        if (isInitialLoad) {
          setLoading(true);
        }
        const trimmedSearch = debounceSearch.trim();
        const statusValue =
          statusFilter === "All Status" ? undefined : statusFilter.toLowerCase();
        const data = await fetchPayoutsData(currentPage, pageSize, {
          searchString: trimmedSearch || undefined,
          status: statusValue,
        });
        setPayouts(data.payouts);
        setStats(data.stats);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
        setPayouts([]);
        setStats(null);
        setPagination(null);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchPayouts();
  }, [currentPage, pageSize, debounceSearch, statusFilter]);

  // Define table columns
  const columns: ColumnDef<Payout>[] = [
    {
      accessorKey: "creator",
      header: "Creator",
      cell: ({ row }) => {
        const creator = row.original.creator;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-[36px] w-[36px]">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback>{creator.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                {creator.name}
              </p>
              <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                {creator.username}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: () => (
        <div className="flex items-center gap-1">
          <span>Amount</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 3V9M6 3L8 5M6 3L4 5"
              stroke="#5B5B5B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
          {formatCurrency(row.getValue("amount"))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let bgColor = "bg-[#2BAC47]";
        if (status === "FAILED") bgColor = "bg-[#C83532]";
        if (status === "PROCESSING") bgColor = "bg-[#EF8943]";

        return (
          <div
            className={`inline-flex items-center px-[8px] py-[4px] rounded-[4px] ${bgColor} text-white INT500 text-[12px] leading-[16px] tracking-[6%] font-medium uppercase`}
          >
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {formatDate(row.getValue("date"))}
        </span>
      ),
    },
  ];

  const showingStart =
    totalPayouts === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd =
    totalPayouts === 0
      ? 0
      : Math.min(showingStart + pageSize - 1, totalPayouts);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading payouts..." />
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Payouts
        </h2>
        <p className="mt-[2px] text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
     Track and manage all creator earnings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-[24px]">
        <div className=" flex items-center gap-[12px]">

          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Total payouts processed {salRevIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(stats?.totalProcessed || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Pending payouts {salRevIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(stats?.pendingPayouts || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Failed payouts {salRevIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(stats?.failedPayouts || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-[336px] flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5B5B5B]" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 border-[#F1F1F1] focus-visible:ring-[#F75803] bg-[#F7F7F7] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] border-[#F1F1F1]">
            <SelectValue
              placeholder="All Status"
              className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="All Status"
              className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium"
            >
              All Status
            </SelectItem>
            <SelectItem
              value="Completed"
              className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium"
            >
              Completed
            </SelectItem>
            <SelectItem
              value="Failed"
              className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium"
            >
              Failed
            </SelectItem>
            <SelectItem
              value="Processing"
              className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium"
            >
              Processing
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payouts Table */}
      <div className="bg-white overflow-hidden">
        <UserTable
          data={payouts}
          columns={columns}
          placeholder="Search payouts..."
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080] flex-1">
        <p>
          SHOWING {payouts.length > 0 ? showingStart : 0}-
          {payouts.length > 0 ? showingEnd : 0} OF{" "}
          {totalPayouts.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <button  
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={!pagination?.hasPrevPage}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.21885 8.00047L10.5187 11.3003L9.57592 12.2431L5.33325 8.00047L9.57592 3.75781L10.5187 4.70062L7.21885 8.00047Z"
                fill="#111810"
              />
            </svg> 
          </button>

          <button  
            disabled={!pagination?.hasNextPage}
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.78105 8.00047L5.4812 4.70062L6.42401 3.75781L10.6667 8.00047L6.42401 12.2431L5.4812 11.3003L8.78105 8.00047Z"
                fill="#111810"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayoutsPage;
