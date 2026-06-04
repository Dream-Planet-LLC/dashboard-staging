"use client";

import LoadingState from "@/components/LoadingState";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { UserTable } from "@/components/UserTable";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  MoreVertical,
  EyeOff,
  Store,
  User,
  UserCheck,
  Trash2,
  MoreHorizontal,
  Ban,
} from "lucide-react";
import {
  ListIcon,
  smSquareIcon,
  WhiteListicon,
  WhitesmSquareIcon,
} from "@/svg";
import {
  fetchProductCatalogueData,
  ProductCatalogueItem,
  ProductCataloguePagination,
  deleteStoreItem,
  updateStoreItemStatus,
  fetchAdminUserDetails,
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

const ProductCataloguePage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductCatalogueItem[]>([]);
  const [pagination, setPagination] =
    useState<ProductCataloguePagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [productTypeFilter, setProductTypeFilter] = useState("All Products");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "delete" | "suspend" | "activate" | null
  >(null);
  const [confirmProduct, setConfirmProduct] =
    useState<ProductCatalogueItem | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const pageSize = 10;
  const totalProducts = pagination?.totalDocs || 0;
  const isInitialLoading = loading && !pagination;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const trimmedSearch = debouncedSearch.trim();
        const statusValue =
          statusFilter === "All Status"
            ? undefined
            : statusFilter === "LISTED"
              ? "live"
              : "suspended";
        const typeValue =
          productTypeFilter === "All Products"
            ? undefined
            : productTypeFilter.toLowerCase();
        const data = await fetchProductCatalogueData(currentPage, pageSize, {
          status: statusValue,
          type: typeValue,
          searchString: trimmedSearch || undefined,
        });
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
        setProducts([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, pageSize, debouncedSearch, statusFilter, productTypeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, productTypeFilter]);

  // Action handlers
  const handleUnpublish = (productId: string) => {
    console.log("Unpublish product:", productId);
    // API call to unpublish
  };

  const handleViewStore = (productId: string) => {
    // Find the product to get the creator/seller ID
    const product = products.find((p) => p.id === productId);
    if (product && product.creatorId) {
      router.push(`/sellersstore/${product.creatorId}`);
    }
  };

  const handleViewProfile = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product?.creatorId) {
      toast.error("User profile is not available");
      return;
    }

    const username = product.creator || "";
    setIsProfileSheetOpen(true);
    setProfileLoading(true);
    setProfileData({
      id: product.creatorId,
      name: username.replace("@", "") || "Creator",
      username,
      full_name: username.replace("@", "") || "Creator",
      email: username
        ? `${username.replace("@", "")}@dreamplanet.org`
        : "Not provided",
      phone_number: "Not provided",
      country: "Not provided",
      image: "",
      status: "active",
      createdAt: product.date || new Date().toISOString(),
      verification_type: "Creator",
      noOfMembers: "0",
      noOfPosts: "0",
      noOfInvestor: "0",
      interested_creators: "0",
    });

    try {
      const details = await fetchAdminUserDetails(product.creatorId);
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
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load user details");
    } finally {
      setProfileLoading(false);
    }
  };

  const openConfirm = (
    action: "delete" | "suspend" | "activate",
    product?: ProductCatalogueItem,
  ) => {
    setConfirmAction(action);
    setConfirmProduct(product || null);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction || !confirmProduct) return;
    setConfirmLoading(true);
    try {
      if (confirmAction === "delete") {
        await deleteStoreItem(confirmProduct.id);
        toast.success("Item deleted");
      }
      if (confirmAction === "suspend") {
        await updateStoreItemStatus(confirmProduct.id, "suspended");
        toast.success("Item suspended");
      }
      if (confirmAction === "activate") {
        await updateStoreItemStatus(confirmProduct.id, "listed");
        toast.success("Item activated");
      }
      // Refetch products
      const trimmedSearch = debouncedSearch.trim();
      const statusValue =
        statusFilter === "All Status"
          ? undefined
          : statusFilter === "LISTED"
            ? "live"
            : "suspended";
      const typeValue =
        productTypeFilter === "All Products"
          ? undefined
          : productTypeFilter.toLowerCase();
      const data = await fetchProductCatalogueData(currentPage, pageSize, {
        status: statusValue,
        type: typeValue,
        searchString: trimmedSearch || undefined,
      });
      setProducts(data.products);
      setPagination(data.pagination);
      setConfirmOpen(false);
      setConfirmAction(null);
      setConfirmProduct(null);
    } catch (error) {
      const errorMessage =
        confirmAction === "delete"
          ? "Failed to delete item"
          : confirmAction === "activate"
            ? "Failed to activate item"
            : "Failed to suspend item";
      toast.error(errorMessage);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Table columns
  const columns: ColumnDef<ProductCatalogueItem>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                  P
                </div>
              )}
            </div>
            <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
              {product.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "productType",
      header: "Product type",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {row.getValue("productType")}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: () => (
        <div className="flex items-center gap-1">
          <span>Price</span>
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
          {formatCurrency(row.getValue("price"))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const bgColor =
          status.toLowerCase() === "listed"
            ? "bg-[#2BAC47]"
            : status.toLowerCase() === "suspended"
              ? "bg-[#C83532]"
              : "bg-[#eaeaea]";

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
      accessorKey: "creator",
      header: "Creator",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {row.getValue("creator")}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: () => (
        <div className="flex items-center gap-1">
          <span>Date</span>
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
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {formatDate(row.getValue("date"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        const isSuspended =
          (product.status || "").toString().toLowerCase() === "suspended";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4 text-[#5B5B5B]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleUnpublish(product.id)}
                className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
              >
                <EyeOff className="h-4 w-4" />
                Unpublish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleViewStore(product.id)}
                className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
              >
                <Store className="h-4 w-4" />
                View Store
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleViewProfile(product.id)}
                className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
              >
                <User className="h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              {isSuspended ? (
                <DropdownMenuItem
                  onClick={() => openConfirm("activate", product)}
                  className="flex items-center gap-2 text-[#2BAC47] INT500 text-[14px] cursor-pointer"
                >
                  <UserCheck className="h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => openConfirm("suspend", product)}
                  className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] cursor-pointer"
                >
                  <Ban className="h-4 w-4" />
                  Suspend
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => openConfirm("delete", product)}
                className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Render product card for grid view
  const renderProductCard = (product: ProductCatalogueItem) => {
    const statusBgColor =
      product.status === "LISTED" ? "bg-[#2BAC47]" : "bg-[#C83532]";
    const isSuspended =
      (product.status || "").toString().toLowerCase() === "suspended";

    return (
      <div className="bg-white rounded-lg border border-[#F1F1F1] overflow-hidden md:w-[256px] w-full">
        {/* Product Image */}
        <div className="relative h-[144px] bg-gray-200">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200"></div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-[8px] py-[4px] ${statusBgColor} text-white INT500 text-[12px] leading-[16px] tracking-[6%] font-medium uppercase rounded-[4px]`}
            >
              {product.status}
            </span>
          </div>

          {/* Actions Menu */}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                {product.name}
              </h3>
              <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%] mb-3">
                {product.productType} · {formatDate(product.date)}
              </p>
            </div>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-6 w-6 p-0 text-[#373737] hover:bg-white/20 rounded"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              {/* <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleUnpublish(product.id)}
                  className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
                >
                  <EyeOff className="h-4 w-4" />
                  Unpublish
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewStore(product.id)}
                  className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
                >
                  <Store className="h-4 w-4" />
                  View Store
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewProfile(product.id)}
                  className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                {isSuspended ? (
                  <DropdownMenuItem
                    onClick={() => openConfirm("activate", product)}
                    className="flex items-center gap-2 text-[#2BAC47] INT500 text-[14px] cursor-pointer"
                  >
                    <UserCheck className="h-4 w-4" />
                    Activate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => openConfirm("suspend", product)}
                    className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] cursor-pointer"
                  >
                    <Ban className="h-4 w-4" />
                    Suspend
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => openConfirm("delete", product)}
                  className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent> */}

                  <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleUnpublish(product.id)}
                className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
              >
                <EyeOff className="h-4 w-4" />
                Unpublish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleViewStore(product.id)}
                className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
              >
                <Store className="h-4 w-4" />
                View Store
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleViewProfile(product.id)}
                className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
              >
                <User className="h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              {isSuspended ? (
                <DropdownMenuItem
                  onClick={() => openConfirm("activate", product)}
                  className="flex items-center gap-2 text-[#2BAC47] INT500 text-[14px] cursor-pointer"
                >
                  <UserCheck className="h-4 w-4" />
                  Activate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => openConfirm("suspend", product)}
                  className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] cursor-pointer"
                >
                  <Ban className="h-4 w-4" />
                  Suspend
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => openConfirm("delete", product)}
                className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
              {formatCurrency(product.price)}
            </span>
            <span className="text-[##A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              {product.creator}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const showingStart =
    totalProducts === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd =
    totalProducts === 0
      ? 0
      : Math.min(showingStart + pageSize - 1, totalProducts);

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading products..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Product Catalogue
        </h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
          Manage Marketplace Inventory and monitor listing statuses
        </p>
      </div>

      {/* Search + Filters + View Toggle */}
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
            <SelectTrigger className="w-[140px] border-[#F1F1F1]">
              <SelectValue
                className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
                placeholder="All Status"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                value="All Status"
              >
                All Status
              </SelectItem>
              <SelectItem
                className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                value="LISTED"
              >
                Listed
              </SelectItem>
              <SelectItem
                className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                value="SUSPENDED"
              >
                Suspended
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={productTypeFilter}
            onValueChange={setProductTypeFilter}
          >
            <SelectTrigger className="w-[160px] border-[#F1F1F1]">
              <SelectValue
                className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"
                placeholder="All Products"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                value="All Products"
              >
                All Products
              </SelectItem>
              <SelectItem
                className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                value="Merchandise"
              >
                Merchandise
              </SelectItem>
              <SelectItem
                className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                value="Audio"
              >
                Audio
              </SelectItem>
              <SelectItem
                className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                value="Video"
              >
                Video
              </SelectItem>
              <SelectItem
                className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                value="Podcast"
              >
                Podcast
              </SelectItem>
              <SelectItem
                className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
                value="Tickets"
              >
                Tickets
              </SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle Buttons */}
          <div className="flex rounded overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center justify-center h-[32px] w-[42px] transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#F75803] text-white"
                  : "bg-[#F1F1F1] text-[#5B5B5B] hover:bg-[#FFEEE6]"
              }`}
            >
              {viewMode === "table" ? WhiteListicon : ListIcon}
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center h-[32px] w-[42px] transition-colors cursor-pointer ${
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

      {/* Table or Grid View */}
      {viewMode === "table" ? (
        <div className="bg-white overflow-hidden">
          <UserTable
            data={products}
            columns={columns}
            placeholder="Search products..."
            loading={loading}
          />
        </div>
      ) : (
        <div className="min-h-[320px]">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-[#F75803] border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-[26px]">
              {products.map((product) => (
                <div key={product.id}>{renderProductCard(product)}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080] flex-1">
        <p className="INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          SHOWING {products.length > 0 ? showingStart : 0}-
          {products.length > 0 ? showingEnd : 0} OF{" "}
          {totalProducts.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center cursor-pointer"
            disabled={!pagination?.hasPrevPage}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center cursor-pointer"
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
            disabled={showingEnd >= totalProducts}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <Image
              src="/icons/forwardbutton.svg"
              height={20}
              width={20}
              alt="next"
            />
          </Button> */}
        </div>
      </div>

      {/* Profile Sheet */}
      <Sheet open={isProfileSheetOpen} onOpenChange={setIsProfileSheetOpen}>
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
                  <p className="text-[#A4A4A4] text-[14px]">
                    Members in forum
                  </p>
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
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setConfirmAction(null);
            setConfirmProduct(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "delete"
                ? "Delete item?"
                : confirmAction === "activate"
                  ? "Activate item?"
                  : "Suspend item?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "delete"
                ? confirmProduct
                  ? `This will remove ${confirmProduct.name} from the store.`
                  : "This will remove this item from the store."
                : confirmAction === "activate"
                  ? "This will make the item visible again in the store."
                  : "This will hide the item from the store."}
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
                confirmAction === "activate"
                  ? "bg-[#2BAC47] hover:bg-[#2BAC47]"
                  : "bg-[#C83532] hover:bg-[#C83532]"
              }
            >
              {confirmAction === "delete"
                ? "Delete"
                : confirmAction === "activate"
                  ? "Activate"
                  : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCataloguePage;
