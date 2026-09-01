"use client";

import LoadingState from "@/components/LoadingState";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  EllipsisVertical,
  MoreHorizontal,
  Store,
  User,
  Ban,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { UserTable } from "@/components/UserTable";
import {
  anaBarIcon,
  barIcon,
  WhiteanaBaricon,
  whiteProIcon,
  whiteStoreIcon,
  salRevIcon,
} from "@/svg";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchAdminUserDetails } from "@/lib/api";
import { authenticatedFetch as fetch } from "@/lib/authenticatedApi";

// Types based on API documentation
interface Withdrawal {
  withdrawal_id: number;
  creator_id: number;
  creator_name: string;
  creator_image: string;
  creator_username: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  date: string;
  balance?: WalletBalance;
}

interface WalletBalance {
  wallet_balance: number;
  cashback_balance: number;
  investment_cashback_balance: number;
  referral_balance: number;
}

interface ManualWithdrawal {
  id: number;
  withdrawal_id: number;
  user_id: number;
  creator_id: number;
  user_name: string;
  username: string;
  user_image: string;
  amount: number;
  plaform_revenue?: number | string;
  platform_revenue?: number | string;
  currency: string;
  status: "pending" | "completed" | "rejected";
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_holder_name: string;
  account_type: string;
  routing_number: string;
  swift_code: string;
  bank_address: string;
  rejection_reason?: string;
  processedAt?: string;
  createdAt: string;
  balance?: WalletBalance;
}

interface WithdrawalStats {
  total_processed_payouts: number;
  total_pending_payouts: number;
  total_failed_payouts: number;
}

interface WithdrawalPagination {
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number;
  nextPage: number;
}

// ────────────────────────────────────────────────
const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

const formatCurrencyFixed2 = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

const formatDate = (dateValue?: string | null) => {
  if (!dateValue) return "-";
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

const WithdrawalPage = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [manualWithdrawals, setManualWithdrawals] = useState<ManualWithdrawal[]>([]);
  const [stats, setStats] = useState<WithdrawalStats | null>(null);
  const [pagination, setPagination] = useState<WithdrawalPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"automatic" | "manual">("manual");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<ManualWithdrawal | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [completedDialogOpen, setCompletedDialogOpen] = useState(false);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const pageSize = 20;
  const totalWithdrawals = pagination?.totalDocs || 0;
  const isInitialLoading = loading && isInitialLoad;

  // API functionss
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      
      if (activeTab === "automatic") {
        const response = await fetch(`${baseUrl}/admin/get-withdrawals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            page: currentPage,
            perPage: pageSize,
            searchString: debouncedSearch.trim() || undefined,
            status: statusFilter === "All Status" ? undefined : statusFilter.toLowerCase(),
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch withdrawals");
        
        const data = await response.json();
        if (data.error) throw new Error(data.message);
        
        const responseData = data?.data?.response ?? data?.response;

        setWithdrawals(responseData.docs);
        setStats(responseData.stats);
        setPagination({
          totalDocs: responseData.totalDocs,
          limit: responseData.limit,
          page: responseData.page,
          totalPages: responseData.totalPages,
          hasPrevPage: responseData.hasPrevPage,
          hasNextPage: responseData.hasNextPage,
          prevPage: responseData.prevPage,
          nextPage: responseData.nextPage,
        });
      } else {
        const response = await fetch(`${baseUrl}/admin/get-manual-withdrawals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            page: currentPage,
            perPage: pageSize,
            searchString: debouncedSearch.trim() || undefined,
            status: statusFilter === "All Status" ? undefined : statusFilter.toLowerCase(),
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch manual withdrawals");
        
        const data = await response.json();
        if (data.error) throw new Error(data.message);
        
        const responseData = data?.data?.response ?? data?.response;

        setManualWithdrawals(responseData.docs);
        setPagination({
          totalDocs: responseData.totalDocs,
          limit: responseData.limit,
          page: responseData.page,
          totalPages: responseData.totalPages,
          hasPrevPage: responseData.hasPrevPage,
          hasNextPage: responseData.hasNextPage,
          prevPage: responseData.prevPage,
          nextPage: responseData.nextPage,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const updateWithdrawalStatus = async (withdrawalId: number, status: "completed" | "rejected", reason?: string) => {
    try {
      if (status === "rejected") {
        setRejectLoading(true);
      } else {
        setCompletedLoading(true);
      }
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      
      const response = await fetch(`${baseUrl}/admin/manual-withdrawals/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          withdrawalId,
          status,
          reason: status === "rejected" ? reason : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update withdrawal status");
      
      const data = await response.json();
      console.log("Update withdrawal response:", data);
      if (data.error) throw new Error(data.message || "Failed to update withdrawal status");
      
      toast.success(`Withdrawal ${status} successfully`);
      
      await fetchWithdrawals();
      setRejectDialogOpen(false);
      setCompletedDialogOpen(false);
      setRejectReason("");
      setSelectedWithdrawal(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update withdrawal status");
    } finally {
      if (status === "rejected") {
        setRejectLoading(false);
      } else {
        setCompletedLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, pageSize, debouncedSearch, statusFilter, activeTab]);

  const openWithdrawalDetails = (withdrawal: ManualWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setDetailsDrawerOpen(true);
  };

  const openRejectDialog = (withdrawal: ManualWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectDialogOpen(true);
  };

  const openCompletedDialog = (withdrawal: ManualWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setCompletedDialogOpen(true);
  };

  const openProfileSheet = async () => {
    if (!selectedWithdrawal) return;

    const username = selectedWithdrawal.username || "";
    const transformedProfileData = {
      id: selectedWithdrawal.user_id || selectedWithdrawal.creator_id,
      name: selectedWithdrawal.user_name,
      username,
      full_name: selectedWithdrawal.user_name,
      email: username
        ? `${username.replace("@", "")}@dreamplanet.org`
        : "Not provided",
      phone_number: "Not provided",
      country: "Not provided",
      image: selectedWithdrawal.user_image,
      status:
        selectedWithdrawal.status === "rejected" ? "inactive" : "active",
      createdAt: selectedWithdrawal.createdAt,
      verification_type: "Creator",
      noOfMembers: "0",
      noOfPosts: "0",
      noOfInvestor: "0",
      interested_creators: "0",
    };

    setProfileData(transformedProfileData);
    setIsProfileSheetOpen(true);
    setProfileLoading(true);

    try {
      const details = await fetchAdminUserDetails(
        selectedWithdrawal.user_id || selectedWithdrawal.creator_id,
      );
      setProfileData((current: any) => ({
        ...current,
        id: details.id,
        name: details.full_name || current.name,
        username: details.username || current.username,
        full_name: details.full_name || current.full_name,
        email: details.email || current.email,
        phone_number: details.phone_number || current.phone_number,
        country: details.country || current.country,
        image: details.image || current.image,
        status: details.status || current.status,
        createdAt: details.createdAt || current.createdAt,
        verification_type: details.user_type || current.verification_type,
        noOfMembers: details.noOfMembers ?? current.noOfMembers,
        noOfPosts: details.noOfPosts ?? current.noOfPosts,
        noOfInvestor: details.noOfInvestor ?? current.noOfInvestor,
        interested_creators:
          details.interested_creators ?? current.interested_creators,
        referral_link: details.referral_link || current.referral_link,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load user details");
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfileSheet = () => {
    setIsProfileSheetOpen(false);
  };

  const handleReject = () => {
    if (selectedWithdrawal && rejectReason.trim()) {
      updateWithdrawalStatus(selectedWithdrawal.withdrawal_id, "rejected", rejectReason.trim());
    }
  };

  const handleCompleted = () => {
    if (selectedWithdrawal) {
      updateWithdrawalStatus(selectedWithdrawal.withdrawal_id, "completed");
    }
  };

  // Automatic withdrawals columns
  // const automaticColumns: ColumnDef<Withdrawal>[] = [
  //   {
  //     accessorKey: "creator_name",
  //     header: "Creator",
  //     cell: ({ row }) => {
  //       const withdrawal = row.original;
  //       return (
  //         <div className="flex items-center gap-3">
  //           <Avatar className="h-[36px] w-[36px]">
  //             <AvatarImage src={withdrawal.creator_image} alt={withdrawal.creator_name} />
  //             <AvatarFallback>{withdrawal.creator_name[0]}</AvatarFallback>
  //           </Avatar>
  //           <div>
  //             <p className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
  //               {withdrawal.creator_name}
  //             </p>
  //             <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
  //               {withdrawal.creator_username}
  //             </p>
  //           </div>
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     accessorKey: "amount",
  //     header: () => (
  //       <div className="flex items-center gap-1">
  //         <span>Amount</span>
  //         <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
  //           <path
  //             d="M6 3V9M6 3L8 5M6 3L4 5"
  //             stroke="#5B5B5B"
  //             strokeWidth="1.5"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //         </svg>
  //       </div>
  //     ),
  //     cell: ({ row }) => (
  //       <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
  //         {formatCurrency(row.getValue("amount"))}
  //       </span>
  //     ),
  //   },
  //   {
  //     accessorKey: "status",
  //     header: "Status",
  //     cell: ({ row }) => {
  //       const status = row.getValue("status") as string;
  //       let bgColor = "bg-[#2BAC47]";
  //       if (status === "failed") bgColor = "bg-[#C83532]";
  //       if (status === "processing") bgColor = "bg-[#EF8943]";
  //       if (status === "pending") bgColor = "bg-[#EF8943]";

  //       return (
  //         <div
  //           className={`inline-flex items-center px-[8px] py-[4px] rounded-[4px] ${bgColor} text-white INT500 text-[12px] leading-[16px] tracking-[6%] font-medium uppercase`}
  //         >
  //           {status}
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     accessorKey: "date",
  //     header: "Date",
  //     cell: ({ row }) => (
  //       <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
  //         {formatDate(row.getValue("date"))}
  //       </span>
  //     ),
  //   },
  // ];

  // Manual withdrawals columns
  const manualColumns: ColumnDef<ManualWithdrawal>[] = [
    {
      accessorKey: "user_name",
      header: "Creator",
      cell: ({ row }) => {
        const withdrawal = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-[36px] w-[36px]">
              <AvatarImage src={withdrawal.user_image} alt={withdrawal.user_name} />
              <AvatarFallback>{withdrawal.user_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                {withdrawal.user_name}
              </p>
              <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                {withdrawal.username}
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
      id: "platformRevenue",
      header: "Platform Revenue",
      cell: ({ row }) => {
        const withdrawal = row.original;
        const platformRevenue =
          withdrawal.plaform_revenue ?? withdrawal.platform_revenue ?? 0;

        return (
          <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
            {formatCurrencyFixed2(Number(platformRevenue) || 0)}
          </span>
        );
      },
    },
    {
      accessorKey: "balance",
      header: "Wallet Balance",
      cell: ({ row }) => {
        const withdrawal = row.original;

        return (
          <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
            {formatCurrency(withdrawal.balance?.wallet_balance ?? 0)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let bgColor = "bg-[#2BAC47]";
        if (status === "rejected") bgColor = "bg-[#C83532]";
        if (status === "pending") bgColor = "bg-[#EF8943]";

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
      accessorKey: "bank_name",
      header: "Bank",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {row.getValue("bank_name")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {formatDate(row.getValue("createdAt"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const withdrawal = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <EllipsisVertical className="h-4 w-4 text-[#5B5B5B]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 space-y-3 cursor-pointer">
              <DropdownMenuItem
                className="flex items-center gap-2 INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] text-[#373737] cursor-pointer"
                onClick={() => openWithdrawalDetails(withdrawal)}
              >
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
              
              {withdrawal.status === "pending" && (
                <>
                  <DropdownMenuItem
                    className="flex items-center gap-2 INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] text-[#2BAC47] cursor-pointer"
                    onClick={() => openCompletedDialog(withdrawal)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] text-[#C83532] cursor-pointer"
                    onClick={() => openRejectDialog(withdrawal)}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const showingStart =
    totalWithdrawals === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd =
    totalWithdrawals === 0
      ? 0
      : Math.min(showingStart + pageSize - 1, totalWithdrawals);

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading withdrawals..." />
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Withdrawals
        </h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
          Manage and process creator withdrawal requests
        </p>
      </div>

      {/* Stats Cards - show for automatic withdrawal */}
      {/* {activeTab === "automatic" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-[24px]">
          <div className="flex items-center gap-[12px]">
            <div className="flex flex-col gap-[4px]">
              <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                Total processed payouts {salRevIcon}
              </p>
              <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
                {formatCompactNumber(stats.total_processed_payouts)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[12px]">
            <div className="h-[56px] border-r border-[#E4E4E4]"></div>
            <div className="flex flex-col gap-[4px]">
              <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                Pending payouts {salRevIcon}
              </p>
              <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
                {formatCompactNumber(stats.total_pending_payouts)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[12px]">
            <div className="h-[56px] border-r border-[#E4E4E4]"></div>
            <div className="flex flex-col gap-[4px]">
              <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                Failed payouts {salRevIcon}
              </p>
              <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
                {formatCompactNumber(stats.total_failed_payouts)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="">
        {/* <button
          className={`px-4 py-2 font-medium text-[14px] leading-[20px] tracking-[-1.5%] border-b-2 transition-colors ${
            activeTab === "automatic"
              ? "text-[#F75803] border-[#F75803]"
              : "text-[#A4A4A4] border-transparent hover:text-[#373737]"
          }`}
          onClick={() => {
            setActiveTab("automatic");
            setCurrentPage(1);
          }}
        >
          Automatic Withdrawals
        </button> */}
        {/* <button
          className={`px-4 py-2 font-medium text-[14px] leading-[20px] tracking-[-1.5%] border-b-2 transition-colors ${
            activeTab === "manual"
              ? "text-[#F75803] border-[#F75803]"
              : "text-[#A4A4A4] border-transparent hover:text-[#373737]"
          }`}
          onClick={() => {
            setActiveTab("manual");
            setCurrentPage(1);
          }}
        >
          Manual Withdrawals
        </button> */}
      </div>

      {/* Search + Filter */}
      <div className="py-4 flex items-end justify-end ml-auto">
        {/* <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A4A4A4]" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 border-[#F1F1F1] focus-visible:ring-[#F75803] bg-[#F7F7F7]"
          />
        </div> */}
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
              className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
            >
              All Status
            </SelectItem>
            <SelectItem
              value="pending"
              className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
            >
              Pending
            </SelectItem>
           
            <SelectItem
              value="completed"
              className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
            >
              Completed
            </SelectItem>
       
            {activeTab === "manual" && (
              <SelectItem
                value="rejected"
                className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
              >
                Rejected
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>






      {/* Table */}
      {/* <div className="bg-white overflow-hidden">
        {activeTab === "automatic" ? (
          <UserTable
            data={withdrawals}
            columns={automaticColumns}
            placeholder="Search withdrawals..."
          />
        ) : (
          <UserTable
            data={manualWithdrawals}
            columns={manualColumns}
            placeholder="Search withdrawals..."
          />
        )}
      </div> */}


    <UserTable
            data={manualWithdrawals}
            columns={manualColumns}
            placeholder="Search withdrawals..."
            loading={loading}
          />


      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080] flex-1">
        <p>
          SHOWING {(activeTab === "automatic" ? withdrawals : manualWithdrawals).length > 0 ? showingStart : 0}-
          {(activeTab === "automatic" ? withdrawals : manualWithdrawals).length > 0 ? showingEnd : 0} OF{" "}
          {totalWithdrawals.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
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
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
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

      {/* Withdrawal Details Drawer */}
      <Drawer open={detailsDrawerOpen} onOpenChange={setDetailsDrawerOpen} direction="right">
        <DrawerContent className="h-full max-w-[500px] w-full ml-auto bg-white text-black md:rounded-tl-lg rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none [&>div:first-child]:hidden overflow-x-hidden">
          <div className="flex flex-col h-full w-full">
            <DrawerHeader className="px-8 py-6">
              <div className="flex items-center justify-between">
                <DrawerTitle className="INT500 font-medium text-[20px] leading-[28px] text-[#111810]">
                  Withdrawal Details
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#373737] hover:text-black border border-[#F1F1F1] rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-8 w-full">
              {selectedWithdrawal && (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-[#F1F1F1]">
                    <Avatar className="h-[56px] w-[56px] border-2 border-[#F75803]/30">
                      <AvatarImage src={selectedWithdrawal.user_image} />
                      <AvatarFallback className="bg-[#1A1A1A] text-[#F75803]">
                        {selectedWithdrawal.user_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <button
                        type="button"
                        onClick={openProfileSheet}
                        className="block text-left text-[#111810] INT500 font-medium text-[18px] leading-[24px] tracking-[-1.5%] hover:text-[#F75803] hover:underline"
                      >
                        {selectedWithdrawal.user_name}
                      </button>
                      <button
                        type="button"
                        onClick={openProfileSheet}
                        className="text-[#F75803] INT400 text-[14px] leading-[20px] tracking-[-1.8%] hover:underline"
                      >
                        @{selectedWithdrawal.username}
                      </button>
                    </div>
                  </div>

                  {/* Amount & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F7F7F7] p-4 rounded-lg">
                      <p className="text-[#A4A4A4] INT400 text-[12px] leading-[16px] tracking-[-1.8%] mb-1">
                        Amount
                      </p>
                      <p className="text-[#111810] INT500 font-medium text-[20px] leading-[28px] tracking-[-1.5%]">
                        {formatCurrency(selectedWithdrawal.amount)}
                      </p>
                    </div>
                    <div className="bg-[#F7F7F7] p-4 rounded-lg">
                      <p className="text-[#A4A4A4] INT400 text-[12px] leading-[16px] tracking-[-1.8%] mb-1">
                        Status
                      </p>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-[4px] text-white INT500 text-[12px] leading-[16px] tracking-[6%] font-medium uppercase ${
                          selectedWithdrawal.status === "completed"
                            ? "bg-[#2BAC47]"
                            : selectedWithdrawal.status === "rejected"
                            ? "bg-[#C83532]"
                            : "bg-[#EF8943]"
                        }`}
                      >
                        {selectedWithdrawal.status}
                      </div>
                    </div>
                  </div>

                  {/* Wallet Balances */}
                  <div>
                    <h4 className="text-[#808080] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] mb-4">
                  Balances
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Wallet Balance
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {formatCurrency(
                            selectedWithdrawal.balance?.wallet_balance ?? 0,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Referral Balance
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {formatCurrency(
                            selectedWithdrawal.balance?.referral_balance ?? 0,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Investment Cashback Balance
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {formatCurrency(
                            selectedWithdrawal.balance
                              ?.investment_cashback_balance ?? 0,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div>
                    <h4 className="text-[#808080] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] mb-4">
                      Bank Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Bank Name
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {selectedWithdrawal.bank_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Account Holder
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {selectedWithdrawal.account_holder_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Account Number
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {selectedWithdrawal.account_number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Account Type
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {selectedWithdrawal.account_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Routing Number
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {selectedWithdrawal.routing_number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          SWIFT Code
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {selectedWithdrawal.swift_code}
                        </span>
                      </div>
                    </div>
                  </div>

              
                  <div>
                    <h4 className="text-[#808080] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] mb-4">
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          Created
                        </span>
                        <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                          {formatDate(selectedWithdrawal.createdAt)}
                        </span>
                      </div>
                      {selectedWithdrawal.processedAt && (
                        <div className="flex justify-between">
                          <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                            Processed
                          </span>
                          <span className="text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                            {formatDate(selectedWithdrawal.processedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {selectedWithdrawal.rejection_reason && (
                    <div>
                      <h4 className="text-[#808080] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] mb-4">
                        Rejection Reason
                      </h4>
                      <div className="bg-[#FEF2F2] border border-[#FECACA] p-4 rounded-lg">
                        <p className="text-[#C83532] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                          {selectedWithdrawal.rejection_reason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Profile Sheet */}
      <Sheet open={isProfileSheetOpen} onOpenChange={closeProfileSheet}>
        <SheetContent className="sm:max-w-[519px] overflow-y-auto scrollbar-hide">
          <SheetHeader>
            <SheetTitle className="flex justify-between">
              <p className="text-[#111810] font-medium text-[20px]">
                User Details
              </p>
            </SheetTitle>
          </SheetHeader>
          {profileLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <LoadingState message="Loading user details..." />
            </div>
          ) : (
          <div className="flex flex-col">
            <div className="flex items-center space-x-[12px] mt-[40px] mb-[28px]">
              <Avatar>
                <AvatarImage
                  className="object-cover"
                  src={profileData?.image}
                  alt={profileData?.full_name || "User"}
                />
                <AvatarFallback className="bg-gray-200 text-black">
                  {profileData?.name?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[20px] font-medium text-[#111810]">
                  {profileData?.full_name}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="flex items-center space-x-1">
                    <span className="text-[#A4A4A4]">@</span>
                    <span className="text-[#A4A4A4]">
                      {profileData?.username}
                    </span>
                  </p>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      profileData?.status === "active"
                        ? "bg-[#2BAC47]"
                        : "bg-[#C83532]"
                    }`}
                  ></div>
                  <span className="text-[#A4A4A4] text-[14px]">
                    {profileData?.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-8 mb-[28px]">
              <div className="flex flex-col space-y-1">
                <p className="text-[#A4A4A4] text-[14px]">Members in forum</p>
                <h2 className="font-Recoleta font-medium text-[28px]">
                  {profileData?.noOfMembers}
                </h2>
              </div>
              <div className="h-[61px] w-[1px] bg-[#E4E4E4]"></div>
              <div className="flex flex-col space-y-1">
                <p className="text-[#A4A4A4] text-[14px]">
                  Post in portfolio
                </p>
                <h2 className="font-Recoleta font-medium text-[28px] flex">
                  {profileData?.noOfPosts}
                </h2>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-[#A4A4A4]">Full Name</p>
                <p>{profileData?.full_name}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-[#A4A4A4]">Email</p>
                <p className="text-[#F75803]">{profileData?.email}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-[#A4A4A4]">Phone Number</p>
                <p className="text-[#F75803]">{profileData?.phone_number}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-[#A4A4A4]">Country</p>
                <p>{profileData?.country || "Null"}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-[#A4A4A4]">Interested Creators</p>
                <p>{profileData?.interested_creators}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-[#A4A4A4] line-clamp-2">Date Joined</p>
                <p>{profileData?.createdAt?.substring(0, 10)}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-[#A4A4A4]">No Of Investor</p>
                <p>{profileData?.noOfInvestor}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-[#A4A4A4]">Verification</p>
                <p>{profileData?.verification_type}</p>
              </div>
              {profileData?.referral_link && (
                <div className="flex items-center justify-between gap-4 border-b pb-2">
                  <p className="text-[#A4A4A4]">Referral Link</p>
                  <p className="max-w-[260px] truncate text-right text-[#F75803]">
                    {profileData.referral_link}
                  </p>
                </div>
              )}
            </div>
          </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectLoading}
              className="bg-[#C83532] hover:bg-[#C83532]/80 cursor-pointer min-w-[120px]"
            >
            {rejectLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mx-auto" />
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completed Dialog */}
      <Dialog open={completedDialogOpen} onOpenChange={setCompletedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Completed</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this withdrawal as completed? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleCompleted}
              disabled={completedLoading}
              className="bg-[#2BAC47] hover:bg-[#2BAC47]/80 cursor-pointer min-w-[120px]"
            >
              {completedLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mx-auto" />
              ) : (
                "Mark as Completed"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalPage;
