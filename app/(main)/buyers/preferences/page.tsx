"use client";

import LoadingState from "@/components/LoadingState";
import { refreshIcon } from "@/svg";
import { useState, useEffect } from "react";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface CategoryData {
  name: string;
  units: number;
  color: string;
}

interface RevenueShare {
  category: string;
  percentage: number;
  color: string;
}

interface PurchasePreferenceData {
  categories: CategoryData[];
  revenueShares: RevenueShare[];
  totalRevenue: number;
}

// ────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────
const mockData: PurchasePreferenceData = {
  totalRevenue: 4200000,
  categories: [
    { name: "Audio", units: 1200000, color: "#2CAB5B" },
    { name: "Video", units: 900000, color: "#DD3B83" },
    { name: "Podcast", units: 650000, color: "#249D92" },
    { name: "E-book", units: 500000, color: "#EB6723" },
    { name: "Masterclass", units: 350000, color: "#884CED" },
    { name: "Merchandise", units: 250000, color: "#CE941C" },
    { name: "Tickets", units: 220000, color: "#3971EB" },
    { name: "Hire me", units: 130000, color: "#063D90" },
  ],
  revenueShares: [
    { category: "Audio", percentage: 32.4, color: "#2CAB5B" },
    { category: "Masterclass", percentage: 18.7, color: "#884CED" },
    { category: "Merchandise", percentage: 13.5, color: "#CE941C" },
    { category: "E-book", percentage: 9.8, color: "#EB6723" },
    { category: "Video", percentage: 8.1, color: "#DD3B83" },
    { category: "Podcast", percentage: 6.9, color: "#249D92" },
    { category: "Tickets", percentage: 5.4, color: "#3971EB" },
    { category: "Hire me", percentage: 5.2, color: "#063D90" },
  ],
};

const formatCompactNumber = (num: number): string => {
  if (num === 0) return "0";
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum < 1000) {
    return sign + absNum.toString();
  } else if (absNum < 1_000_000) {
    const value = absNum / 1000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "k";
  } else if (absNum < 1_000_000_000) {
    const value = absNum / 1_000_000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "M";
  } else {
    const value = absNum / 1_000_000_000;
    return sign + value.toFixed(value < 10 ? 1 : 0) + "B";
  }
};

const PurchasePreferencePage = () => {
  const [data, setData] = useState<PurchasePreferenceData | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate API fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setData(mockData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading purchase preferences..." />
      </div>
    );
  }

  if (!data) return null;

  // Find max units for bar chart scaling
  const maxUnits = Math.max(...data.categories.map((c) => c.units));

  // Calculate donut chart segments
  const getDonutSegments = () => {
    let cumulativePercentage = 0;
    return data.revenueShares.map((share) => {
      const startPercentage = cumulativePercentage;
      cumulativePercentage += share.percentage;
      return {
        ...share,
        startPercentage,
        endPercentage: cumulativePercentage,
      };
    });
  };

  const donutSegments = getDonutSegments();

  // Convert percentage to SVG path
  const getDonutPath = (startPercent: number, endPercent: number) => {
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    const startAngle = (startPercent / 100) * 360 - 90;
    const endAngle = (endPercent / 100) * 360 - 90;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = endPercent - startPercent > 50 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Purchase Preference
        </h2>
        <p className="mt-[2px] text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
          Lorem ipsum dolor sit amet consectetur.
        </p>
      </div>

      <div className="flex w-full gap-[24px]">
        {/* Most Purchased Category - Horizontal Bar Chart */}
        <div className="bg-white rounded-lg border border-[#F1F1F1] p-[20px] shadow-[0_4px_8px_0_rgba(0,0,0,0.05)] w-[70%] h-full">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-[#373737] INT400  text-[14px] leading-[20px] tracking-[-1.8%]">
              Most Purchased Category
            </h3>
            {refreshIcon}
          </div>

          <div className="space-y-[24px]">
            {data.categories.map((category, index) => {
              const percentage = (category.units / maxUnits) * 100;
              return (
                <div key={index} className="space-y-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#111810] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
                      {category.name}
                    </span>
                    <span className="text-[#A4A4A4] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium">
                      {formatCompactNumber(category.units)} Units
                    </span>
                  </div>
                  <div className="w-full h-[16px] bg-[#E4E4E4] rounded-[4px] overflow-hidden">
                    <div
                      className="h-full rounded-tl-[4px] rounded-bl-[4px] relative"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    >
                      {/* Diagonal stripes pattern */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                            135deg,
                            transparent,
                            transparent 5px,
                            #FFFFFF 3px,
                            #FFFFFF 8px
                          )`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Share - Donut Chart */}
        <div className="bg-white rounded-lg border border-[#F1F1F1] p-[20px] shadow-[0_4px_8px_0_rgba(0,0,0,0.05)] w-[30%] h-full">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-[#373737] INT400 font-medium text-[14px] leading-[20px] tracking-[-1.8%]">
              Revenue Share
            </h3>
            {refreshIcon}
          </div>

          <div className="flex flex-col gap-[24px] w-full ">
            <div className="flex items-center w-full justify-center">
            {/* Donut Chart */}
            <div className="relative w-[212px] h-[212px] flex-shrink-0">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {donutSegments.map((segment, index) => {
                  const radius = 80;
                  const innerRadius = 55;
                  const centerX = 100;
                  const centerY = 100;
                  const gap = 0.02;

                  const startAngle =
                    (segment.startPercentage / 100) * 2 * Math.PI + gap / 2;

                  const endAngle =
                    (segment.endPercentage / 100) * 2 * Math.PI - gap / 2;

                  const x1 = centerX + radius * Math.cos(startAngle);
                  const y1 = centerY + radius * Math.sin(startAngle);
                  const x2 = centerX + radius * Math.cos(endAngle);
                  const y2 = centerY + radius * Math.sin(endAngle);

                  const x3 = centerX + innerRadius * Math.cos(endAngle);
                  const y3 = centerY + innerRadius * Math.sin(endAngle);
                  const x4 = centerX + innerRadius * Math.cos(startAngle);
                  const y4 = centerY + innerRadius * Math.sin(startAngle);

                  const largeArcFlag = segment.percentage > 50 ? 1 : 0;

                  const pathData = [
                    `M ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `L ${x3} ${y3}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                    "Z",
                  ].join(" ");

                  return <path key={index} d={pathData} fill={segment.color} />;
                })}
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[#111810] INT500 font-medium text-[30px] leading-[100%] tracking-[-1px]">
                  ${formatCompactNumber(data.totalRevenue)}
                </p>
                <p className="text-[#A4A4A4] INT400 text-[12px] leading-[16px] tracking-[6%] uppercase mt-[2px]">
                  Gross Revenue
                </p>
              </div>
            </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {data.revenueShares.map((share, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between  border-b border-[#F1F1F1] py-[16px]"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-[5px] h-[18px] rounded-[32px] flex-shrink-0"
                      style={{ backgroundColor: share.color }}
                    />
                    <span className="text-[#A4A4A4] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                      {share.category}
                    </span>
                  </div>
                  <span className="text-[#111810] INT500 font-medium text-[14px] leading-[20px] tracking-[-1.5%]">
                    {share.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePreferencePage;
