"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { UserTable } from "@/components/UserTable";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/LoadingState";

import {
  buyIcon,
  livProIcon,
  ordIcon,
  plaRevIcon,
  salRevIcon,
  sellIcon,
} from "@/svg";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface Stat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  tooltip?: string;
}

interface RecentProduct {
  id: string | number;
  name: string;
  type: string;
  price: number;
  creator: string;
  date: string;
  previewImage?: string | null; // ← added: URL from backend (or null/undefined)
  mediaType?: "image" | "video" | "audio" | null; // optional – for future indicators
}

interface OverviewData {
  salesRevenue: number;
  platformRevenue: number;
  orders: number;
  sellers: number;
  buyers: number;
  liveProducts: number;
  recentProducts: RecentProduct[];
}

// ────────────────────────────────────────────────
// Mock data – replace with real API fetch
// ────────────────────────────────────────────────
const mockData: OverviewData = {
  salesRevenue: 232000,
  platformRevenue: 5200,
  orders: 1179,
  sellers: 123,
  buyers: 76,
  liveProducts: 10300,
  recentProducts: [
    {
      id: "1",
      name: "Midnight Tour Dad Cap",
      type: "Merchandise",
      price: 20,
      creator: "@eonvibes",
      date: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150",
    },
    {
      id: "2",
      name: "Backstage Energy Hoodie",
      type: "Merchandise",
      price: 40,
      creator: "@Echo_Rush",
      date: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=150",
    },
    {
      id: "3",
      name: "Studio Nights Vinyl LP",
      type: "Audio",
      price: 60,
      creator: "@urbanflux LP",
      date: "19 Jan, 2026",
      previewImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150",
      mediaType: "audio",
    },
    // Add more with previewImage: null to test fallback
  ],
};

const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

const formatCompactNumber = (num: number): string => {
  if (num === 0) return "0";

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum < 1000) {
    return sign + absNum.toString();
  } else if (absNum < 1_000_000) {
    // Thousands → K
    const value = absNum / 1000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "K";
  } else if (absNum < 1_000_000_000) {
    // Millions → M
    const value = absNum / 1_000_000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "M";
  } else {
    // Billions → B (rare for now, but future-proof)
    const value = absNum / 1_000_000_000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "B";
  }
};

// Small helper for fallback when no image
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

const Overview = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Replace with your real API call
    const fetchOverview = async () => {
      try {
        setLoading(true);
        // const res = await fetch("/api/admin/overview");
        // const json = await res.json();
        // setData(json);

        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading overview..." />
      </div>
    );
  }

  if (!data)
    return (
      <div className="p-8 text-center text-[#808080]">No data available</div>
    );

  // ────────────────────────────────────────────────
  // Stats
  // ────────────────────────────────────────────────
  const stats: Stat[] = [
    {
      title: "Sales revenue",
      value: formatCompactNumber(data.salesRevenue), // ← changed
      icon: salRevIcon,
    },
    {
      title: "Platform revenue",
      value: formatCompactNumber(data.platformRevenue),
      icon: plaRevIcon,
    },
    {
      title: "Orders",
      value: formatCompactNumber(data.orders),
      icon: ordIcon,
    },
    {
      title: "Sellers",
      value: formatCompactNumber(data.sellers),
      icon: sellIcon,
    },
    {
      title: "Buyers",
      value: formatCompactNumber(data.buyers),
      icon: buyIcon,
    },
    {
      title: "Live Products",
      value: formatCompactNumber(data.liveProducts),
      icon: livProIcon,
    },
  ];

  // ────────────────────────────────────────────────
  // Table Columns
  // ────────────────────────────────────────────────
  const columns: ColumnDef<RecentProduct>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => {
        const product = row.original;
        const hasPreview =
          product.previewImage && product.previewImage.trim() !== "";

        return (
          <div className="flex items-center gap-3">
            {/* Product preview – image or fallback square */}
            <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0 bg-gray-200">
              {hasPreview ? (
                <img
                  src={product.previewImage!}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to gray square with initial if image fails
                    (e.target as HTMLImageElement).style.display = "none";
                    // You can also set a default placeholder image
                    // (e.target as HTMLImageElement).src = "/icons/fallback-product.svg";
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs font-medium text-gray-500">
                  {getTypeInitial(product.type)}
                </div>
              )}

              {/* Optional small indicator for audio/video if mediaType exists */}
              {product.mediaType === "audio" && (
                <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[9px] px-1 rounded-tl">
                  ♫
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
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.5%]">
          {row.getValue("type")}
        </div>
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
      accessorKey: "creator",
      header: "Creator",
      cell: ({ row }) => (
        <span className=" text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.5%] hover:underline cursor-pointer">
          {row.getValue("creator")}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className=" text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.5%]">
          {row.getValue("date")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] font-medium INT500 text-[24px] leading-[32px] tracking-[-1.5%]">
          Overview
        </h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          Lorem ipsum dolor sit amet consectetur.
        </p>
      </div>

      {/* Stats – your exact styling retained */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className=" p-3 flex items-center gap-3">
            <div className="h-[60px] border-l border-[#E4E4E4]"></div>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                  {stat.title}
                  {stat.icon}
                </div>
              </div>
              <p className=" font-medium text-[#111810] INT500 text-[28px] leading-[32px] tracking-[-2%]">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div> */}

      <div className="flex flex-row gap-[109px]">
        <div className=" flex items-center gap-[12px]">
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Sales Revenue {salRevIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(data?.salesRevenue || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Platform Revenue {plaRevIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(data?.platformRevenue || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Orders {ordIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(data?.orders || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Sellers {sellIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(data?.sellers || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Buyers {buyIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(data?.buyers || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Live Products {livProIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(data?.liveProducts || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="bg-white overflow-hidden">
        <div className="flex items-center justify-between py-4">
          <h3 className=" font-medium text-[#000000] INT500 text-[18px] leading-[24px] tracking-[-1.5%]">
            Recently added products
          </h3>
          <Button onClick={() => router.push("/products/catalogue")} className="btnColored">View All</Button>
        </div>

        <UserTable
          data={data.recentProducts}
          columns={columns}
          placeholder="Search products..."
        />
      </div>
    </div>
  );
};

export default Overview;
