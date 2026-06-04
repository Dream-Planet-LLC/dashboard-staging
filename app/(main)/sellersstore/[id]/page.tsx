"use client";

import LoadingState from "@/components/LoadingState";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  EllipsisVertical,
  Ban,
  Trash2,
  EyeOff,
  User,
  MoreHorizontal,
  MoreHorizontalIcon,
} from "lucide-react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { UserTable } from "@/components/UserTable";
import { ListIcon, smSquareIcon, WhiteListicon, whiteProIcon, WhitesmSquareIcon } from "@/svg";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  fetchCreatorStoreDetails,
  CreatorStoreCreator,
  CreatorStoreProduct,
  CreatorStorePagination,
  deleteStoreItem,
  updateStoreItemStatus,
  fetchAdminUserDetails,
} from "@/lib/api";
import { toast } from "sonner";

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

const getTypeInitial = (type: string) => {
  const map: Record<string, string> = {
    Merchandise: "M",
    Audio: "A",
    Podcast: "P",
    Video: "V",
    Digital: "D",
  };
  return map[type] || "?";
};

const SellerStorePage = () => {
  const [creator, setCreator] = useState<CreatorStoreCreator | null>(null);
  const [products, setProducts] = useState<CreatorStoreProduct[]>([]);
  const [pagination, setPagination] = useState<CreatorStorePagination | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "delete" | "suspend" | "activate" | null
  >(null);
  const [confirmProduct, setConfirmProduct] =
    useState<CreatorStoreProduct | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const pageSize = 20;
  const router = useRouter();
  const params = useParams();
  const creatorIdParam = params?.id;
  const creatorId =
    typeof creatorIdParam === "string" && creatorIdParam.trim() !== ""
      ? Number.isNaN(Number(creatorIdParam))
        ? creatorIdParam
        : Number(creatorIdParam)
      : creatorIdParam || "";

  const fetchSellerStore = async () => {
    try {
      setLoading(true);
      if (!creatorId) {
        setCreator(null);
        setProducts([]);
        setPagination(null);
        return;
      }
      const data = await fetchCreatorStoreDetails(
        creatorId as string | number,
        currentPage,
        pageSize,
      );
      setCreator(data.creator);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      setCreator(null);
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerStore();
  }, [creatorId, currentPage, pageSize]);

  const openConfirm = (
    action: "delete" | "suspend" | "activate",
    product?: CreatorStoreProduct,
  ) => {
    setConfirmAction(action);
    setConfirmProduct(product || null);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setConfirmLoading(true);
    try {
      if (confirmAction === "delete" && confirmProduct) {
        await deleteStoreItem(confirmProduct.id);
        toast.success("Item deleted");
      }
      if (confirmAction === "suspend" && confirmProduct) {
        await updateStoreItemStatus(confirmProduct.id, "suspended");
        toast.success("Item suspended");
      }
      if (confirmAction === "activate" && confirmProduct) {
        await updateStoreItemStatus(confirmProduct.id, "active");
        toast.success("Item activated");
      }
      await fetchSellerStore();
      setConfirmOpen(false);
      setConfirmAction(null);
      setConfirmProduct(null);
    } catch (error) {
      const errorMessage = confirmAction === "delete"
        ? "Failed to delete item"
        : confirmAction === "activate"
          ? "Failed to activate item"
          : "Failed to suspend item";
      toast.error(errorMessage);
    } finally {
      setConfirmLoading(false);
    }
  };

  const openProfileSheet = async () => {
    if (!creator) return;

    setIsProfileSheetOpen(true);
    setProfileLoading(true);
    setProfileData({
      id: creator.id,
      name: creator.name,
      username: creator.username,
      full_name: creator.name,
      email: `${creator.username.replace("@", "")}@dreamplanet.org`,
      phone_number: "Not provided",
      country: "Not provided",
      image: creator.avatarUrl,
      status: "active",
      createdAt: new Date().toISOString(),
      verification_type: creator.role || "Creator",
      noOfMembers: "0",
      noOfPosts: "0",
      noOfInvestor: "0",
      interested_creators: "0",
    });

    try {
      const details = await fetchAdminUserDetails(creator.id);
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

  const closeProfileSheet = () => {
    setIsProfileSheetOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading store..." />
      </div>
    );
  }

  if (!creator)
    return (
      <div className="p-8 text-center text-[#808080]">Store not found</div>
    );

  const columns: ColumnDef<CreatorStoreProduct>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => {
        const product = row.original;
        const hasPreview =
          product.previewImage && product.previewImage.trim() !== "";

        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0 bg-gray-200">
              {hasPreview ? (
                <img
                  src={product.previewImage!}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-medium text-gray-500">
                  {getTypeInitial(product.type)}
                </div>
              )}
            </div>
            <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
              {row.getValue("name")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Product type",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.5%]">
          {row.getValue("type")}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
          {formatCurrency(row.getValue("price"))}
        </span>
      ),
    },
    {
      accessorKey: "unitsSold",
      header: "Unit Sold",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.5%]">
          {row.getValue("unitsSold")}
        </span>
      ),
    },
    {
      accessorKey: "uploadedDate",
      header: "Uploaded Date",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.5%]">
          {formatDate(row.getValue("uploadedDate"))}
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
                <EllipsisVertical className="h-4 w-4 text-[#5B5B5B]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 space-y-3">
              <DropdownMenuItem className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
                <EyeOff className="h-4 w-4" />
                Unpublish
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium cursor-pointer"
                onClick={() => openProfileSheet()}
              >
                {whiteProIcon}
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
                <Ban className="h-4 w-4" />
                <button
                  type="button"
                  onClick={() =>
                    openConfirm(isSuspended ? "activate" : "suspend", product)
                  }
                >
                  {isSuspended ? "Activate" : "Suspend"}
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
                <Trash2 className="h-4 w-4" />
                <button
                  type="button"
                  onClick={() => openConfirm("delete", product)}
                >
                  Delete
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const ProductCard = ({ product }: { product: CreatorStoreProduct }) => {
    const hasPreview =
      product.previewImage && product.previewImage.trim() !== "";
    const isSuspended =
      (product.status || "").toString().toLowerCase() === "suspended";

    return (
      <div className="bg-white border border-[#EDEDED] w-[256px] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Preview Image / Placeholder */}
        <div className="relative h-[144px] bg-gray-100">
          {hasPreview ? (
            <img
              src={product.previewImage!}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
              {getTypeInitial(product.type)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <h4 className="font-medium text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] truncate">
              {product.name}
            </h4>

            <div className="">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 ml-auto text-[#373737]">
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 space-y-3">
                  <DropdownMenuItem className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                    <EyeOff className="h-4 w-4" />
                    Unpublish
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] cursor-pointer"
                    onClick={() => openProfileSheet()}
                  >
                    <User className="h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2  text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                    <Ban className="h-4 w-4" />
                    <button
                      type="button"
                      onClick={() =>
                        openConfirm(isSuspended ? "activate" : "suspend", product)
                      }
                    >
                      {isSuspended ? "Activate" : "Suspend"}
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                    <Trash2 className="h-4 w-4" />
                    <button
                      type="button"
                      onClick={() => openConfirm("delete", product)}
                    >
                      Delete
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              {product.type} . {formatDate(product.uploadedDate)}
            </span>

            {/* <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
           
            </span> */}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
              {formatCurrency(product.price)}
            </span>

            <span className="text-[#C8C8C8] INT500 text-[12px] leading-[18px] tracking-[6%] font-medium">
              SOLD {product.unitsSold}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-[24px]">

           {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[14px] leading-[20px] tracking-[-1.5%]">
        <Link 
          href="/sellersstore" 
          className="text-[#C8C8C8] hover:text-[#F75803] transition-colors INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]"
        >
          Sellers Store /
        </Link>
      
        <span className="text-[#111810] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">Store</span>
      </nav>


      {/* Header with seller info */}
      <div className="flex items-start justify-between flex-wrap gap-6 w-full">
        <div className="flex flex-col gap-4 w-full">
          <Avatar className="h-[56px] w-[56px]">
            <AvatarImage src={creator.avatarUrl} alt={creator.name} />
            <AvatarFallback>{creator.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-[#111810] INT500 font-medium text-[18px] leading-[24px] tracking-[-1.5%]">
                {creator.name}
              </h2>
              <p className="text-[#A8A8A8] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                {creator.username} • {creator.role}
              </p>
            </div>

            {/* View toggle buttons */}
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
      </div>

      {/* Table Section */}
      {/* <div className="bg-white overflow-hidden">
        <UserTable
          data={products}
          columns={columns}
          placeholder="Search products..."
        />
      </div> */}

      {/* Content – switch between table and grid */}
      {viewMode === "table" ? (
        <div className="bg-white overflow-hidden">
          <UserTable
            data={products}
            columns={columns}
            placeholder="Search products..."
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-[27px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080]">
        <p>
          Page {pagination?.page || currentPage} of{" "}
          {pagination?.totalPages || 0}
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


          {/* <Button variant="outline" size="sm" disabled={data.currentPage === 1}>
            <Image
              src="/icons/backbutton.svg"
              height={20}
              width={20}
              alt="prev"
            />
          </Button>




          <Button
            variant="outline"
            size="sm"
            disabled={showingEnd >= data.totalProducts}
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
                  ? "bg-[#111810] hover:bg-[#111810]"
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
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SellerStorePage;
