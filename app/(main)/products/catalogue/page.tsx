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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MoreVertical,
  EyeOff,
  Store,
  User,
  UserCheck,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  ListIcon,
  smSquareIcon,
  WhiteListicon,
  WhitesmSquareIcon,
} from "@/svg";
import Image from "next/image";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  productType: string;
  price: number;
  status: "LISTED" | "SUSPENDED";
  creator: string;
  date: string;
  image?: string;
}

// ────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Midnight Tour Dad Cap",
    productType: "Merchandise",
    price: 20,
    status: "LISTED",
    creator: "@neonvibes",
    date: "19 Jan, 2026",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200",
  },
  {
    id: "2",
    name: "Midnight Tour Dad Cap",
    productType: "Audio",
    price: 20,
    status: "SUSPENDED",
    creator: "@neonvibes",
    date: "19 Jan, 2026",
    image: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=200",
  },
  {
    id: "3",
    name: "Midnight Tour Dad Cap",
    productType: "Video",
    price: 20,
    status: "SUSPENDED",
    creator: "@neonvibes",
    date: "19 Jan, 2026",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200",
  },
  {
    id: "4",
    name: "Midnight Tour Dad Cap",
    productType: "Tickets",
    price: 20,
    status: "LISTED",
    creator: "@neonvibes",
    date: "19 Jan, 2026",
    image: "https://images.unsplash.com/photo-1594608661623-aa0bd689a7dd?w=200",
  },
  {
    id: "5",
    name: "Midnight Tour Dad Cap",
    productType: "Podcast",
    price: 20,
    status: "LISTED",
    creator: "@neonvibes",
    date: "19 Jan, 2026",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200",
  },
  {
    id: "6",
    name: "Midnight Tour Dad Cap",
    productType: "Merchandise",
    price: 12,
    status: "LISTED",
    creator: "@neonvibes",
    date: "19 Jan, 2025",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200",
  },
  {
    id: "7",
    name: "Midnight Tour Dad Cap",
    productType: "Merchandise",
    price: 12,
    status: "LISTED",
    creator: "@neonvibes",
    date: "19 Jan, 2025",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=200",
  },
  {
    id: "8",
    name: "Midnight Tour Dad Cap",
    productType: "Merchandise",
    price: 12,
    status: "LISTED",
    creator: "@neonvibes",
    date: "19 Jan, 2025",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200",
  },
];

const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

const ProductCataloguePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [productTypeFilter, setProductTypeFilter] = useState("All Products");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 16;
  const totalProducts = 12560;

  // Simulate API fetch
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setProducts(mockProducts);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Action handlers
  const handleUnpublish = (productId: string) => {
    console.log("Unpublish product:", productId);
    // API call to unpublish
  };

  const handleViewStore = (productId: string) => {
    console.log("View store for product:", productId);
    // Navigate to store
  };

  const handleViewProfile = (productId: string) => {
    console.log("View profile for product:", productId);
    // Navigate to profile
  };

  const handleActivate = (productId: string) => {
    console.log("Activate product:", productId);
    // API call to activate
  };

  const handleDelete = (productId: string) => {
    console.log("Delete product:", productId);
    // API call to delete
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || product.status === statusFilter;

    const matchesProductType =
      productTypeFilter === "All Products" ||
      product.productType === productTypeFilter;

    return matchesSearch && matchesStatus && matchesProductType;
  });

  // Table columns
  const columns: ColumnDef<Product>[] = [
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
        const bgColor = status === "LISTED" ? "bg-[#2BAC47]" : "bg-[#C83532]";

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
          {row.getValue("date")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
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
              <DropdownMenuItem
                onClick={() => handleActivate(product.id)}
                className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
              >
                <UserCheck className="h-4 w-4" />
                Activate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(product.id)}
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
  const renderProductCard = (product: Product) => {
    const statusBgColor =
      product.status === "LISTED" ? "bg-[#2BAC47]" : "bg-[#C83532]";

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
                {product.productType} · {product.date}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button
                  variant="ghost"
                  className="h-6 w-6 p-0 text-[#373737] hover:bg-white/20 rounded"
                >
  <MoreHorizontal/>
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
                <DropdownMenuItem
                  onClick={() => handleActivate(product.id)}
                  className="flex items-center gap-2 text-[#373737] INT500 text-[14px] cursor-pointer"
                >
                  <UserCheck className="h-4 w-4" />
                  Activate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(product.id)}
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

  const showingStart = (currentPage - 1) * pageSize + 1;
  const showingEnd = Math.min(
    Math.min(showingStart + pageSize - 1, totalProducts),
    showingStart + filteredProducts.length - 1,
  );

  if (loading) {
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
          Lorem ipsum dolor sit amet consectetur.
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
              <SelectValue className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"  placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]" value="All Status">All Status</SelectItem>
              <SelectItem className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]" value="LISTED">Listed</SelectItem>
              <SelectItem className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]" value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={productTypeFilter}
            onValueChange={setProductTypeFilter}
          >
            <SelectTrigger className="w-[160px] border-[#F1F1F1]">
              <SelectValue className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]"  placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]" value="All Products">All Products</SelectItem>
              <SelectItem className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]" value="Merchandise">Merchandise</SelectItem>
              <SelectItem className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]" value="Audio">Audio</SelectItem>
              <SelectItem className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]" value="Video">Video</SelectItem>
              <SelectItem className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]" value="Podcast">Podcast</SelectItem>
              <SelectItem className="text-[#373737] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]" value="Tickets">Tickets</SelectItem>
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

      {/* Table or Grid View */}
      {viewMode === "table" ? (
        <div className="bg-white overflow-hidden">
          <UserTable
            data={filteredProducts}
            columns={columns}
            placeholder="Search products..."
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-[26px]">
          {filteredProducts.map((product) => (
            <div key={product.id}>{renderProductCard(product)}</div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#808080] flex-1">
        <p className="INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          SHOWING {filteredProducts.length > 0 ? showingStart : 0}-
          {filteredProducts.length > 0 ? showingEnd : 0} OF{" "}
          {totalProducts.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">

          
              <button  
            className="text-[#111810] bg-[#F7F7F7] h-8 w-8  rounded-full flex items-center justify-center cursor-pointer"
         
             disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
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
        disabled={showingEnd >= totalProducts}
            onClick={() => setCurrentPage(currentPage + 1)}
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
    </div>
  );
};

export default ProductCataloguePage;
