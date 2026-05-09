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
} from "@/svg";
import { useRouter } from "next/navigation";
import {
  fetchSellersStoreData,
  SellerStore,
  SellersStorePagination,
  updateSellerEligibilityStatus,
  fetchCreatorAnalytics,
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

const SellersStore = () => {
  const [sellers, setSellers] = useState<SellerStore[]>([]);
  const [pagination, setPagination] = useState<SellersStorePagination | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedSeller, setSelectedSeller] = useState<SellerStore | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<
    SellerStore["analytics"] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "suspend" | "activate" | null
  >(null);
  const [confirmSeller, setConfirmSeller] = useState<SellerStore | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const pageSize = 20;
  const totalSellers = pagination?.totalDocs || 0;
  const router = useRouter();

  // Simulate fetching analytics when drawer opens
  useEffect(() => {
    if (drawerOpen && selectedSeller) {
      setAnalyticsLoading(true);
      setAnalyticsData(null);

      const loadAnalytics = async () => {
        try {
          const analytics = await fetchCreatorAnalytics(selectedSeller.id);
          setAnalyticsData({
            totalOrders: analytics.statistics.totalOrders,
            totalRevenue: analytics.statistics.totalRevenue,
            masterclassHosted: analytics.statistics.totalMasterclassHosted,
            hireRequests: analytics.statistics.totalHireRequest,
            bestSellingProduct: {
              name: "Best Selling Product",
              image: analytics.bestSellingProduct?.image,
            },
            unitsSold: analytics.bestSellingProduct?.quantitySold || 0,
            revenue: analytics.bestSellingProduct?.totalRevenue || 0,
          });
        } catch (error) {
          toast.error("Failed to load analytics");
        } finally {
          setAnalyticsLoading(false);
        }
      };

      loadAnalytics();
    }
  }, [drawerOpen, selectedSeller]);

  const handleOpenAnalytics = (seller: SellerStore) => {
    setSelectedSeller(seller);
    setDrawerOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        // Only show loader on initial load
        if (isInitialLoad) {
          setLoading(true);
        }
        const trimmedSearch = debouncedSearch.trim();
        const statusValue =
          statusFilter === "All Status" ? undefined : statusFilter.toLowerCase();
        const data = await fetchSellersStoreData(currentPage, pageSize, {
          searchString: trimmedSearch || undefined,
          sellerEligibilityStatus: statusValue,
        });
        setSellers(data.sellers);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
        setSellers([]);
        setPagination(null);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchSellers();
  }, [currentPage, pageSize, debouncedSearch, statusFilter]);

  const refetchSellers = async () => {
    const trimmedSearch = debouncedSearch.trim();
    const statusValue =
      statusFilter === "All Status" ? undefined : statusFilter.toLowerCase();
    const data = await fetchSellersStoreData(currentPage, pageSize, {
      searchString: trimmedSearch || undefined,
      sellerEligibilityStatus: statusValue,
    });
    setSellers(data.sellers);
    setPagination(data.pagination);
  };

  const handleSuspendSeller = async (seller: SellerStore) => {
    try {
      await updateSellerEligibilityStatus(seller.id, "suspended");
      toast.success("Seller suspended");
      await refetchSellers();
    } catch (error) {
      toast.error("Failed to suspend seller");
    }
  };

  const handleActivateSeller = async (seller: SellerStore) => {
    try {
      await updateSellerEligibilityStatus(seller.id, "active");
      toast.success("Seller activated");
      await refetchSellers();
    } catch (error) {
      toast.error("Failed to activate seller");
    }
  };

  const openConfirm = (seller: SellerStore, action: "suspend" | "activate") => {
    setConfirmSeller(seller);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const openProfileSheet = (seller: SellerStore) => {
    // Transform seller data to match profile data structure
    const transformedProfileData = {
      id: seller.id,
      name: seller.name,
      username: seller.username,
      full_name: seller.name,
      email: `${seller.username.replace('@', '')}@dreamplanet.org`, // Placeholder email
      phone_number: "Not provided",
      country: "Not provided",
      image: seller.avatarUrl,
      status: seller.status.toLowerCase(),
      createdAt: new Date().toISOString(), // Placeholder
      verification_type: seller.role || "Creator",
      noOfMembers: "0", // Placeholder
      noOfPosts: "0", // Placeholder
      noOfInvestor: "0", // Placeholder
      interested_creators: "0", // Placeholder
    };
    setProfileData(transformedProfileData);
    setIsProfileSheetOpen(true);
  };

  const closeProfileSheet = () => {
    setIsProfileSheetOpen(false);
  };

  const handleConfirmAction = async () => {
    if (!confirmSeller || !confirmAction) return;
    setConfirmLoading(true);
    try {
      if (confirmAction === "suspend") {
        await handleSuspendSeller(confirmSeller);
      } else {
        await handleActivateSeller(confirmSeller);
      }
      setConfirmOpen(false);
      setConfirmSeller(null);
      setConfirmAction(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading sellers..." />
      </div>
    );
  }

  if (!sellers)
    return (
      <div className="p-8 text-center text-[#808080]">No data available</div>
    );

  const columns: ColumnDef<SellerStore>[] = [
    {
      accessorKey: "name",
      header: "Creator",
      cell: ({ row }) => {
        const seller = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-[36px] w-[36px]">
              <AvatarImage src={seller.avatarUrl} alt={seller.name} />
              <AvatarFallback>{seller.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                {seller.name}
              </p>
              <p className=" text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                {seller.username}
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
        let bg =
          "bg-[#2BAC47] text-[#FFFFFF] INT500 font-medium leading-[16px] tracking-[6%] text-[12px]";

        if (status === "SUSPENDED") {
          bg = "bg-[#C83532]";
        } else if (status === "PENDING") {
          bg = "bg-[#EF8943]";
        } else if (status === "INACTIVE") {
          bg = "bg-[#A4A4A4]";
        }

        return (
          <div
            className={`inline-flex items-center px-3 py-1 rounded-[4px] text-[#FFFFFF] INT500 leading-[16px] tracking-[6%] text-[12px] font-medium border ${bg} `}
          >
            {status}
          </div>
        );
      },
    },
{
  accessorKey: "liveProducts",
  header: "Live Products",
  cell: ({ row }) => {
    const value = row.getValue("liveProducts");

    return (
      <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
        {value !== null && value !== undefined ? String(value) : "-"}
      </span>
    );
  },
},
    {
      accessorKey: "totalEarnings",
      header: "Total Earnings",
      cell: ({ row }) => (
        <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
          {formatCurrency(row.getValue("totalEarnings"))}
        </span>
      ),
    },
    {
      accessorKey: "platformRevenue",
      header: "Platform revenue",
      cell: ({ row }) => (
        <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
          {formatCurrency(row.getValue("platformRevenue"))}
        </span>
      ),
    },
    {
      accessorKey: "lastActivity",
      header: "Last activity",
      cell: ({ row }) => {
        const value = row.getValue("lastActivity");
        return (
          <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
            {formatDate(value as string | null)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const seller = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <EllipsisVertical className="h-4 w-4 text-[#5B5B5B]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 space-y-3">
              {seller.status !== "INACTIVE" && (
                <DropdownMenuItem
                  className="flex items-center gap-2 INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] text-[#373737] cursor-pointer"
                  onClick={() => handleOpenAnalytics(seller)}
                >
                  {WhiteanaBaricon}
                  More Analytics
                </DropdownMenuItem>
              )}

              {seller.status !== "INACTIVE" && (
                <DropdownMenuItem
                  className="flex items-center gap-2 INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] text-[#373737] cursor-pointer"
                  onClick={() => router.push(`/sellersstore/${seller.id}`)}
                >
                  {whiteStoreIcon}
                  View Store
                </DropdownMenuItem>
              )}

              <DropdownMenuItem 
                className="flex items-center gap-2 INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] text-[#373737] cursor-pointer"
                onClick={() => openProfileSheet(seller)}
              >
                {whiteProIcon}
                View Profile
              </DropdownMenuItem>
              {seller.status === "SUSPENDED" && (
                <DropdownMenuItem className="flex items-center gap-2 INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] text-[#2BAC47]">
                  <User className="h-4 w-4" />
                  <button type="button" onClick={() => openConfirm(seller, "activate")}>
                    Activate
                  </button>
                </DropdownMenuItem>
              )}
              {seller.status !== "SUSPENDED" && (
                <DropdownMenuItem className="flex items-center gap-2 INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] text-[#C83532]">
                  <Ban className="h-4 w-4" />
                  <button type="button" onClick={() => openConfirm(seller, "suspend")}>
                    Suspend
                  </button>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const showingStart =
    totalSellers === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd =
    totalSellers === 0
      ? 0
      : Math.min(showingStart + pageSize - 1, totalSellers);

  return (
    <div className="space-y-2 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Sellers Store
        </h2>
        <p className="mt-1.5  text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
          View and Manage Seller’s Store Activities
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A4A4A4]" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#F1F1F1] focus-visible:ring-[#F75803] bg-[#F7F7F7]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] border-[#F1F1F1] ">
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
              value="ACTIVE"
              className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
            >
              ACTIVE
            </SelectItem>
            <SelectItem
              value="SUSPENDED"
              className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
            >
              SUSPENDED
            </SelectItem>
            <SelectItem
              value="PENDING"
              className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
            >
              PENDING
            </SelectItem>
            <SelectItem
              value="INACTIVE"
              className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
            >
              INACTIVE
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white overflow-hidden">
        <UserTable
          data={sellers}
          columns={columns}
          placeholder="Search sellers..."
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080] flex-1">
        <p>
          SHOWING {sellers.length > 0 ? showingStart : 0}-
          {sellers.length > 0 ? showingEnd : 0} OF{" "}
          {totalSellers.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          {/* <Button
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center"
            variant="outline"
            size="sm"
            disabled={data.currentPage === 1}
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
          </Button> */}

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

{/* 
          <Button
            variant="outline"
            size="sm"
            disabled={showingEnd >= filteredSellers.length}
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center"
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
          </Button> */}
        </div>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerContent className="h-full max-w-[500px] w-full ml-auto bg-white text-black md:rounded-tl-lg rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none  [&>div:first-child]:hidden overflow-x-hidden">
          <div className="flex flex-col h-full w-full">
            <DrawerHeader className="px-8 py-6">
              <div className="flex items-center justify-between">
                <DrawerTitle className="INT500 font-medium text-[20px] leading-[28px] text-[#111810]">
                  More Analytics
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#373737] hover:text-black border border-[#F1F1F1] rounded-full "
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-8  w-full">
              {analyticsLoading ? (
                // ─── Loading state inside drawer ───
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin h-12 w-12 border-4 border-[#F75803] border-t-transparent rounded-full mb-6" />
                  <p className="text-gray-400 text-lg">
                    Loading analytics for {selectedSeller?.name}...
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    This may take a moment
                  </p>
                </div>
              ) : (
                <>
                  {/* Seller Header */}
                  {selectedSeller && (
                    <div className="flex flex-col gap-5 mb-8">
                      <Avatar className="h-[56px] w-[56px] border-2 border-[#F75803]/30">
                        <AvatarImage src={selectedSeller.avatarUrl} />
                        <AvatarFallback className="bg-[#1A1A1A] text-[#F75803]">
                          {selectedSeller.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-[#111810] INT500 font-medium text-[18px] leading-[24px] tracking-[-1.5%]">
                          {selectedSeller.name}
                        </h3>
                        <p className="text-[#808080] INT400 text-[14px] leading-[20px] tracking-[-1.8%] mt-1">
                          {selectedSeller.username}
                        </p>
                        {selectedSeller.role && (
                          <p className="text-[#808080] INT400 text-[14px] leading-[20px] tracking-[-1.8%] mt-2">
                            {selectedSeller.role}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Analytics Snapshot */}
                  <div className="mb-12 w-full">
                    <div className="w-full ">
                      <h4 className="text-[#808080] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] mb-3 gap-2 flex items-center mb-8">
                        {anaBarIcon} Analytics Snapshot
                      </h4>
                      <div className="grid grid-cols-2 w-full">
                        <div className="flex flex-col justify-center gap-2 items-center border-[1.2px] border-[#F1F1F1] w-full h-[96px] rounded-tl-[4px]">
                          <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                            Total orders
                          </p>
                          <p className="text-[#111810] INT500 text-[24px] leading-[32px] tracking-[-1.5%] font-medium">
                            {analyticsData?.totalOrders?.toLocaleString() ??
                              "123"}
                          </p>
                        </div>
                        <div className="flex flex-col justify-center gap-2 items-center border-[1.2px] border-[#F1F1F1] w-full h-[96px] rounded-tr-[4px]">
                          <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                            Total Revenue
                          </p>
                          <p className="text-[#111810] INT500 text-[24px] leading-[32px] tracking-[-1.5%] font-medium">
                            $
                            {(
                              analyticsData?.totalRevenue ?? 10300
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col justify-center gap-2 items-center border-[1.2px] border-[#F1F1F1] w-full h-[96px] rounded-bl-[4px]">
                          <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                            Masterclass Hosted
                          </span>
                          <span className="text-[#111810] INT500 text-[24px] leading-[32px] tracking-[-1.5%] font-medium">
                            {(
                              analyticsData?.masterclassHosted ?? 10300
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex flex-col justify-center gap-2 items-center border-[1.2px] border-[#F1F1F1] w-full h-[96px] rounded-br-[4px]">
                          <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                            Hire Requests
                          </span>
                          <span className="text-[#111810] INT500 text-[24px] leading-[32px] tracking-[-1.5%] font-medium">
                            {(
                              analyticsData?.hireRequests ?? 10300
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Best Selling Product */}
                  <div className="mb-12 ">
                    <h4 className="text-[#808080] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%] mb-3 gap-2 flex items-center">
                      {anaBarIcon} Best Selling Product
                    </h4>
                    <div className="bg-[#F1F1F1] p-8  min-h-[320px] flex items-center justify-center ">
                      {analyticsData?.bestSellingProduct?.image ? (
                        <img
                          src={analyticsData.bestSellingProduct.image}
                          alt="Best selling"
                          className="max-h-60 object-contain rounded-lg shadow-2xl"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <p className="text-2xl mb-3">Product Preview</p>
                          <p className="text-base">(Image not available yet)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Units Sold & Revenue */}
                  <div className="mb-10 flex flex-col gap-4">
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-row items-center gap-1">
                        {barIcon}
                        <h4 className="text-[#A4A4A4] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
                          Units Sold
                        </h4>
                      </div>

                      <div className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
                        {(analyticsData?.unitsSold ?? 7687).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-row justify-between">
                      <div className="flex flex-row items-center gap-1">
                        {barIcon}
                        <h4 className="text-[#A4A4A4] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
                          Revenue
                        </h4>
                      </div>

                      <div className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
                        ${(analyticsData?.revenue ?? 123849).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setConfirmSeller(null);
            setConfirmAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "suspend" ? "Suspend seller?" : "Activate seller?"}
            </DialogTitle>
            <DialogDescription>
              {confirmSeller
                ? `Are you sure you want to ${confirmAction} ${confirmSeller.name}?`
                : "Are you sure you want to continue?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleConfirmAction}
              disabled={confirmLoading}
              loading={confirmLoading}
              className={
                confirmAction === "suspend"
                  ? "bg-[#C83532] hover:bg-[#C83532]"
                  : "bg-[#2BAC47] hover:bg-[#2BAC47]"
              }
            >
              {confirmAction === "suspend" ? "Suspend" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Sheet */}
      <Sheet open={isProfileSheetOpen} onOpenChange={closeProfileSheet}>
        <SheetContent className="sm:max-w-[519px] overflow-y-auto scrollbar-hide">
          <SheetHeader>
            <SheetTitle className="flex justify-between">
              <p className="text-[#111810] font-medium text-[20px]">
                User Details
              </p>
              {/* <Image
                src={"/icons/cancelIcon.svg"}
                alt="cancelIcon"
                className="cursor-pointer transition-all active:scale-95 "
                onClick={() => {
                  closeProfileSheet()
                }}
                width={26}
                height={26}
              /> */}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col">
            <div className="flex items-center space-x-[12px] mt-[40px] mb-[28px]">
            <Avatar>
              <AvatarImage
                className="object-cover"
                src={profileData?.image}
                alt="@shadcn"
              />
              <AvatarFallback className="bg-gray-200 text-black">
              {profileData?.name?.[0] || ""}              </AvatarFallback>
            </Avatar>
              <div>
                <p className="text-[20px] font-medium text-[#111810]">
                  {profileData?.full_name}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="flex items-center space-x-1">
                    <span className="text-[#A4A4A4]">@</span>
                    <span className="text-[#A4A4A4]">{profileData?.username}</span>
                  </p>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      profileData?.status === "active" ? "bg-[#2BAC47]" : "bg-[#C83532]"
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
                <h2 className="font-Recoleta font-medium text-[28px] flex ">
                  {profileData?.noOfPosts}
                </h2>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Full Name</p>
                <p className="">{profileData?.full_name}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Email</p>
                <p className="text-[#F75803]">{profileData?.email}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Phone Number</p>
                <p className="text-[#F75803]">{profileData?.phone_number}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Country</p>
                <p className="">{profileData?.country || "Null"}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Interested Creators</p>
                <p className="">{profileData?.interested_creators}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4] line-clamp-2">Date Joined</p>
                <p className="">{profileData?.createdAt?.substring(0, 10)}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">No Of Investor</p>
                <p className="">{profileData?.noOfInvestor}</p>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className=" text-[#A4A4A4]">Verification</p>
                <p className="">{profileData?.verification_type}</p>
              </div>
            </div>
          </div>
          <SheetFooter>
            {profileData?.status === "active" ? (
              <Button
                onClick={async () => {
                  try {
                 
                    closeProfileSheet();
                  } catch (error) {
                  }
                }}
                className="bg-[#C83532] hover:bg-[#C83532]"
              >
                Deactivate Account
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  try {
                   
                    closeProfileSheet();
                  } catch (error) {
                  }
                }}
                className="bg-[#2BAC47] hover:bg-[#2BAC47]"
              >
                Activate Account
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SellersStore;
