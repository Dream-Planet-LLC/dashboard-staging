"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface Product {
  id: string | number;
  name: string;
  type: string; // "Merchandise" | "Audio" | etc.
  price: number;
  creator: string; // @username
  unitsSold: number | string; // number or "-" for pending/inactive
  uploadedDate: string;
  previewImage?: string | null;
  status?: "published" | "unpublished" | "suspended"; // for future filtering
}

interface SellerStoreData {
  seller: {
    name: string;
    username: string;
    avatarUrl?: string;
    role: string;
  };
  products: Product[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
}

// ────────────────────────────────────────────────
// Mock data – replace with real API fetch (e.g. /api/sellers/[id]/products)
// ────────────────────────────────────────────────
const mockData: SellerStoreData = {
  seller: {
    name: "Randall Heathcote",
    username: "@Randheill",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    role: "Alien creator • Artist/Musician",
  },
  products: [
    {
      id: "1",
      name: "Midnight Tour Dad Cap",
      type: "Merchandise",
      price: 20,
      creator: "@neonvibes",
      unitsSold: 0,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150",
    },
    {
      id: "2",
      name: "Backstage Energy Hoodie",
      type: "Merchandise",
      price: 40,
      creator: "@Echo_Rush",
      unitsSold: 45,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150",
    },
    {
      id: "3",
      name: "Studio Nights Vinyl LP",
      type: "Audio",
      price: 60,
      creator: "@urbanflux",
      unitsSold: 120,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150",
    },
     {
      id: "1",
      name: "Midnight Tour Dad Cap",
      type: "Merchandise",
      price: 20,
      creator: "@neonvibes",
      unitsSold: 0,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150",
    },
    {
      id: "2",
      name: "Backstage Energy Hoodie",
      type: "Merchandise",
      price: 40,
      creator: "@Echo_Rush",
      unitsSold: 45,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150",
    },
    {
      id: "3",
      name: "Studio Nights Vinyl LP",
      type: "Audio",
      price: 60,
      creator: "@urbanflux",
      unitsSold: 120,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150",
    }, {
      id: "1",
      name: "Midnight Tour Dad Cap",
      type: "Merchandise",
      price: 20,
      creator: "@neonvibes",
      unitsSold: 0,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150",
    },
    {
      id: "2",
      name: "Backstage Energy Hoodie",
      type: "Merchandise",
      price: 40,
      creator: "@Echo_Rush",
      unitsSold: 45,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150",
    },
    {
      id: "3",
      name: "Studio Nights Vinyl LP",
      type: "Audio",
      price: 60,
      creator: "@urbanflux",
      unitsSold: 120,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150",
    }, {
      id: "1",
      name: "Midnight Tour Dad Cap",
      type: "Merchandise",
      price: 20,
      creator: "@neonvibes",
      unitsSold: 0,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150",
    },
    {
      id: "2",
      name: "Backstage Energy Hoodie",
      type: "Merchandise",
      price: 40,
      creator: "@Echo_Rush",
      unitsSold: 45,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150",
    },
    {
      id: "3",
      name: "Studio Nights Vinyl LP",
      type: "Audio",
      price: 60,
      creator: "@urbanflux",
      unitsSold: 120,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150",
    }, {
      id: "1",
      name: "Midnight Tour Dad Cap",
      type: "Merchandise",
      price: 20,
      creator: "@neonvibes",
      unitsSold: 0,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150",
    },
    {
      id: "2",
      name: "Backstage Energy Hoodie",
      type: "Merchandise",
      price: 40,
      creator: "@Echo_Rush",
      unitsSold: 45,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150",
    },
    {
      id: "3",
      name: "Studio Nights Vinyl LP",
      type: "Audio",
      price: 60,
      creator: "@urbanflux",
      unitsSold: 120,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150",
    }, {
      id: "1",
      name: "Midnight Tour Dad Cap",
      type: "Merchandise",
      price: 20,
      creator: "@neonvibes",
      unitsSold: 0,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150",
    },
    {
      id: "2",
      name: "Backstage Energy Hoodie",
      type: "Merchandise",
      price: 40,
      creator: "@Echo_Rush",
      unitsSold: 45,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150",
    },
    {
      id: "3",
      name: "Studio Nights Vinyl LP",
      type: "Audio",
      price: 60,
      creator: "@urbanflux",
      unitsSold: 120,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150",
    }, {
      id: "1",
      name: "Midnight Tour Dad Cap",
      type: "Merchandise",
      price: 20,
      creator: "@neonvibes",
      unitsSold: 0,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150",
    },
    {
      id: "2",
      name: "Backstage Energy Hoodie",
      type: "Merchandise",
      price: 40,
      creator: "@Echo_Rush",
      unitsSold: 45,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150",
    },
    {
      id: "3",
      name: "Studio Nights Vinyl LP",
      type: "Audio",
      price: 60,
      creator: "@urbanflux",
      unitsSold: 120,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150",
    }, {
      id: "1",
      name: "Midnight Tour Dad Cap",
      type: "Merchandise",
      price: 20,
      creator: "@neonvibes",
      unitsSold: 0,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150",
    },
    {
      id: "2",
      name: "Backstage Energy Hoodie",
      type: "Merchandise",
      price: 40,
      creator: "@Echo_Rush",
      unitsSold: 45,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150",
    },
    {
      id: "3",
      name: "Studio Nights Vinyl LP",
      type: "Audio",
      price: 60,
      creator: "@urbanflux",
      unitsSold: 120,
      uploadedDate: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150",
    },
    // ... add more
  ],
  totalProducts: 1, // change to real total
  currentPage: 1,
  pageSize: 10,
};

const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

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
  const [data, setData] = useState<SellerStoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
   const router = useRouter();

  useEffect(() => {
    // TODO: Replace with real fetch – use seller ID from params or context
    const fetchSellerStore = async () => {
      try {
        setLoading(true);
        // Example: const res = await fetch(`/api/sellers/${sellerId}/store`);
        // const json = await res.json();
        // setData(json);

        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 900);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchSellerStore();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-[#F75803] border-t-transparent rounded-full mx-auto" />
          <p className="text-[#808080]">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="p-8 text-center text-[#808080]">Store not found</div>
    );

  const columns: ColumnDef<Product>[] = [
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
          {row.getValue("uploadedDate")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: () => (
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
            <DropdownMenuItem className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
              {whiteProIcon}
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
              <Ban className="h-4 w-4" />   
              Suspend
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const showingStart = (data.currentPage - 1) * data.pageSize + 1;
  const showingEnd = Math.min(
    showingStart + data.pageSize - 1,
    data.totalProducts,
  );

  const ProductCard = ({ product }: { product: Product }) => {
    const hasPreview =
      product.previewImage && product.previewImage.trim() !== "";

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
                  <DropdownMenuItem className="flex items-center gap-2 text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                    <User className="h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2  text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                    <Ban className="h-4 w-4" />
                    Suspend
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-[#C83532] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              {product.type} . {product.uploadedDate}
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
            <AvatarImage src={data.seller.avatarUrl} alt={data.seller.name} />
            <AvatarFallback>{data.seller.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-[#111810] INT500 font-medium text-[18px] leading-[24px] tracking-[-1.5%]">
                {data.seller.name}
              </h2>
              <p className="text-[#A8A8A8] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                {data.seller.username} • {data.seller.role}
              </p>
            </div>

            {/* View toggle buttons */}
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
      </div>

      {/* Table Section */}
      {/* <div className="bg-white overflow-hidden">
        <UserTable
          data={data.products}
          columns={columns}
          placeholder="Search products..."
        />
      </div> */}

      {/* Content – switch between table and grid */}
      {viewMode === "table" ? (
        <div className="bg-white overflow-hidden">
          <UserTable
            data={data.products}
            columns={columns}
            placeholder="Search products..."
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-[27px]">
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080]">
        <p>
          Page {data.currentPage} of{" "}
          {Math.ceil(data.totalProducts / data.pageSize)}
        </p>
        <div className="flex items-center gap-2">

              <button  
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center cursor-pointer"
         
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
          </button>


          <button  
         disabled={showingEnd >= data.totalProducts}
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
    </div>
  );
};

export default SellerStorePage;
