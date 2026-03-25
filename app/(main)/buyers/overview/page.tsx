"use client";

import LoadingState from "@/components/LoadingState";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UserTable } from "@/components/UserTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CalendarIcon, PeopleIcon, refreshIcon, TooltipLine } from "@/svg";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface BuyerStats {
  totalFans: number;
  activeBuyers: number;
  dormantBuyers: number;
  buyerGrowth: number;
  buyerGrowthChange: number;
  buyerRetention: {
    repeat: number;
    oneTime: number;
  };
}

interface ChartDataPoint {
  date: string;
  value: number;
  displayDate: string;
}

interface TopBuyer {
  id: string;
  fan: {
    name: string;
    username: string;
    avatar?: string;
  };
  totalSpent: number;
  lastPurchase: string;
}

type TimePeriod =
  | "This Week"
  | "Last Week"
  | "Last Year"
  | "This Year"
  | "Custom";

// ────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────
const mockStats: BuyerStats = {
  totalFans: 232000,
  activeBuyers: 5200,
  dormantBuyers: 10300,
  buyerGrowth: 18.4,
  buyerGrowthChange: 2.1,
  buyerRetention: {
    repeat: 1950000,
    oneTime: 550000,
  },
};

// Chart data for different time periods
const chartDataByPeriod: Record<TimePeriod, ChartDataPoint[]> = {
  "This Week": [
    { date: "MON", value: 8.2, displayDate: "Mon, Jan 5" },
    { date: "TUE", value: 10.5, displayDate: "Tue, Jan 6" },
    { date: "WED", value: 12.5, displayDate: "Wed, Jan 7" },
    { date: "THUR", value: 9.8, displayDate: "Thu, Jan 8" },
    { date: "FRI", value: 11.2, displayDate: "Fri, Jan 9" },
    { date: "SAT", value: 10.0, displayDate: "Sat, Jan 10" },
    { date: "SUN", value: 9.5, displayDate: "Sun, Jan 11" },
  ],
  "Last Week": [
    { date: "MON", value: 7.5, displayDate: "Mon, Dec 29" },
    { date: "TUE", value: 9.2, displayDate: "Tue, Dec 30" },
    { date: "WED", value: 11.8, displayDate: "Wed, Dec 31" },
    { date: "THUR", value: 10.5, displayDate: "Thu, Jan 1" },
    { date: "FRI", value: 12.0, displayDate: "Fri, Jan 2" },
    { date: "SAT", value: 11.5, displayDate: "Sat, Jan 3" },
    { date: "SUN", value: 10.8, displayDate: "Sun, Jan 4" },
  ],
  "Last Year": [
    { date: "JAN", value: 5.5, displayDate: "January" },
    { date: "FEB", value: 8.2, displayDate: "February" },
    { date: "MAR", value: 10.5, displayDate: "March" },
    { date: "APR", value: 7.8, displayDate: "April" },
    { date: "MAY", value: 12.5, displayDate: "May" },
    { date: "JUN", value: 6.5, displayDate: "June" },
    { date: "JUL", value: 9.8, displayDate: "July" },
    { date: "AUG", value: 11.2, displayDate: "August" },
    { date: "SEP", value: 10.5, displayDate: "September" },
    { date: "OCT", value: 13.8, displayDate: "October" },
    { date: "NOV", value: 11.5, displayDate: "November" },
    { date: "DEC", value: 9.2, displayDate: "December" },
  ],
  "This Year": [
    { date: "JAN", value: 8.5, displayDate: "January" },
    { date: "FEB", value: 10.2, displayDate: "February" },
    { date: "MAR", value: 0, displayDate: "March" },
    { date: "APR", value: 0, displayDate: "April" },
    { date: "MAY", value: 0, displayDate: "May" },
    { date: "JUN", value: 0, displayDate: "June" },
    { date: "JUL", value: 0, displayDate: "July" },
    { date: "AUG", value: 0, displayDate: "August" },
    { date: "SEP", value: 0, displayDate: "September" },
    { date: "OCT", value: 0, displayDate: "October" },
    { date: "NOV", value: 0, displayDate: "November" },
    { date: "DEC", value: 0, displayDate: "December" },
  ],
  Custom: [],
};

const mockTopBuyers: TopBuyer[] = [
  {
    id: "1",
    fan: {
      name: "Alex Morgan",
      username: "@neonbyte",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    totalSpent: 1320567,
    lastPurchase: "19 Jan, 2026",
  },
  {
    id: "2",
    fan: {
      name: "Alex Morgan",
      username: "@neonbyte",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    totalSpent: 1320567,
    lastPurchase: "19 Jan, 2026",
  },
  {
    id: "3",
    fan: {
      name: "Alex Morgan",
      username: "@neonbyte",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    totalSpent: 1320567,
    lastPurchase: "19 Jan, 2026",
  },
];

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

const BuyersPage = () => {
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("Last Year");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  // ── NEW: date-range state ──
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Simulate API fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setStats(mockStats);
        setTopBuyers(mockTopBuyers);
        setChartData(chartDataByPeriod[timePeriod]);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update chart when time period changes
  useEffect(() => {
    if (timePeriod !== "Custom") {
      setChartData(chartDataByPeriod[timePeriod]);
    }
  }, [timePeriod]);

  // ── NEW: open date picker immediately when Custom is chosen ──
  const handleTimePeriodChange = (value: string) => {
    const period = value as TimePeriod;
    setTimePeriod(period);

    if (period === "Custom") {
      setDatePickerOpen(true);
    } else {
      setDatePickerOpen(false);
    }
  };

  // ── NEW: label shown in the trigger after a range is applied ──
  const getSelectLabel = () => {
    if (timePeriod === "Custom" && dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yy")}`;
    }
    return timePeriod;
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#373737] text-white px-3 py-2 rounded shadow-lg flex gap-2 items-center">
          {TooltipLine}
          <div className="flex flex-col">
            <p className="text-[14px] text-[#E4E4E4] INT400 leading-[20px] tracking-[-1.8%]">
              {data.displayDate}
            </p>

            <div className="flex gap-2 items-center">
              <p className="text-[24px] font-medium INT500 text-[#FFFFFF] leading-[24px] tracking-[0%]">
                {data.value.toFixed(1)}%{" "}
              </p>

              <p className="text-[#2BAC47] text-[14px] leading-[20px] tracking-[1.5%] INT500 font-medium">
                +2.1% <br /> <span className="text-[#C8C8C8]">VS PREV</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Table columns
  const columns: ColumnDef<TopBuyer>[] = [
    {
      accessorKey: "fan",
      header: "Fan",
      cell: ({ row }) => {
        const fan = row.original.fan;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-[36px] w-[36px]">
              <AvatarImage src={fan.avatar} alt={fan.name} />
              <AvatarFallback>{fan.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-[#373737] INT500 text-[14px] leading-[20px] tracking-[-1.5%]">
                {fan.name}
              </p>
              <p className="text-[#A4A4A4] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                {fan.username}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalSpent",
      header: () => (
        <div className="flex items-center gap-1">
          <span>Total Spent</span>
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
          {formatCurrency(row.getValue("totalSpent"))}
        </span>
      ),
    },
    {
      accessorKey: "lastPurchase",
      header: "Last Purchase",
      cell: ({ row }) => (
        <span className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
          {row.getValue("lastPurchase")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button className="text-[#F75803] INT500 text-[14px] leading-[20px] tracking-[-1.5%] font-medium hover:underline">
          View Profile
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading buyers data..." />
      </div>
    );
  }

  // Calculate retention percentages
  const totalRetention =
    (stats?.buyerRetention.repeat || 0) + (stats?.buyerRetention.oneTime || 0);
  const repeatPercentage =
    ((stats?.buyerRetention.repeat || 0) / totalRetention) * 100;
  const oneTimePercentage =
    ((stats?.buyerRetention.oneTime || 0) / totalRetention) * 100;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-[#111810] INT500 font-medium text-[24px] leading-[32px] tracking-[-1.5%]">
          Buyers
        </h2>
        <p className="mt-1.5 text-[#A8A8A8] INT400 font-normal text-[14px] tracking-[-1.8%] leading-[20px]">
       Track buyer growth and engagement metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-row gap-[109px]">
        <div className=" flex items-center gap-[12px]">
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Total fans {PeopleIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(stats?.totalFans || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Active buyers {PeopleIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(stats?.activeBuyers || 0)}
            </p>
          </div>
        </div>

        <div className=" flex items-center gap-[12px]">
          <div className="h-[56px] border-r border-[#E4E4E4]"></div>
          <div className="flex flex-col gap-[4px]">
            <p className="flex items-center gap-[6px] text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Dormant buyers {PeopleIcon}
            </p>
            <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
              {formatCompactNumber(stats?.dormantBuyers || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="flex flex-row w-full gap-[24px]">
        {/* Buyer Growth Chart */}
        <div className="bg-white w-[70%]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[#5B5B5B] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
                Buyer Growth
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[#111810] INT500 font-medium text-[28px] leading-[32px] tracking-[-2%]">
                  {stats?.buyerGrowth}%
                </p>
                <span className="text-[#2BAC47] INT500 font-medium text-[14px] leading-[20px] tracking-[1.5%]">
                  +{stats?.buyerGrowthChange}% <br />{" "}
                  <span className="text-[#C8C8C8] INT500 font-medium text-[12px] leading-[16px] tracking-[6%]">
                    VS PREV YEAR
                  </span>
                </span>
              </div>
            </div>

            {/* Select + date picker popover */}
            <div className="relative">
              <Select
                value={timePeriod}
                onValueChange={handleTimePeriodChange}
                onOpenChange={(open) => {
                  if (open && timePeriod === "Custom") {
                    setDatePickerOpen(true);
                  }
                }}
              >
                <SelectTrigger className="w-[140px] border-[#F1F1F1]">
                  <SelectValue>{getSelectLabel()}</SelectValue>
                  {CalendarIcon}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="This Week">This Week</SelectItem>
                  <SelectItem value="Last Week">Last Week</SelectItem>
                  <SelectItem value="This Year">This Year</SelectItem>
                  <SelectItem value="Last Year">Last Year</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {/* Date picker drops down directly under the select */}
              {datePickerOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-white border border-[#F1F1F1] rounded-lg shadow-lg p-4 space-y-3">
                  <p className="text-[#111810] INT500 text-[14px] font-medium">
                    Select Date Range
                  </p>
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-[#F1F1F1]">
                    <p className="text-[13px] INT400 text-[#5B5B5B]">
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, "MMM d, yyyy")} → ${format(dateRange.to, "MMM d, yyyy")}`
                        : dateRange?.from
                          ? `${format(dateRange.from, "MMM d, yyyy")} → pick end`
                          : "Pick a start date"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDateRange(undefined);
                          setTimePeriod("Last Year");
                          setDatePickerOpen(false);
                        }}
                        className="px-3 py-1.5 text-[13px] INT500 text-[#5B5B5B] border border-[#E4E4E4] rounded-md hover:bg-[#F7F7F7]"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!dateRange?.from || !dateRange?.to}
                        onClick={() => {
                          // fetch custom data here later
                          setChartData([]);
                          setDatePickerOpen(false);
                        }}
                        className="px-3 py-1.5 text-[13px] INT500 text-white bg-[#F75803] hover:bg-[#E54D00] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── CHANGED: margin + padding on XAxis so JAN/DEC never clip ── */}
          <div className="h-[297px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F1F1"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  interval={0}
                  tick={{ fill: "#808080", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#F75803"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: "#F75803" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buyer Retention Donut Chart */}
        <div className="bg-white rounded-lg border border-[#F1F1F1] p-[20px] w-[30%] h-full">
          <div className="flex items-center gap-2 mb-6">
            <p className="text-[#373737] INT400 text-[14px] leading-[20px] tracking-[-1.8%]">
              Buyer retention
            </p>
            {refreshIcon}
          </div>

          <div className="flex flex-col gap-[24px]">
            <div className="flex justify-center w-full">
              {/* Donut Chart */}
              <div className="relative w-[200px] h-[200px]">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#F1F1F1"
                    strokeWidth="28"
                  />
                  {/* Repeat segment (dark red/brown) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#8B3A3A"
                    strokeWidth="28"
                    strokeDasharray={`${(repeatPercentage / 100) * 502.65} 502.65`}
                    strokeDashoffset="0"
                  />
                  {/* One-time segment (orange/yellow) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#F5A623"
                    strokeWidth="28"
                    strokeDasharray={`${(oneTimePercentage / 100) * 502.65} 502.65`}
                    strokeDashoffset={`-${(repeatPercentage / 100) * 502.65}`}
                  />
                </svg>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-[5px] h-[18px] rounded-[32px] bg-[#BF3100]"></div>
                  <span className="text-[#808080] INT500 font-medium text-[16px] leading-[24px] tracking-[1.5%]">
                    Repeat
                  </span>
                </div>
                <span className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[1.5%]">
                  {formatCompactNumber(stats?.buyerRetention.repeat || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-8 border-t border-[#F1F1F1] py-[16px]">
                <div className="flex items-center gap-2">
                  <div className="w-[5px] h-[18px] rounded-[32px] bg-[#FE9E30]"></div>
                  <span className="text-[#808080] INT500 font-medium text-[16px] leading-[24px] tracking-[1.5%]">
                    One-time
                  </span>
                </div>
                <span className="text-[#111810] INT500 font-medium text-[16px] leading-[24px] tracking-[1.5%]">
                  {formatCompactNumber(stats?.buyerRetention.oneTime || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Engaging Buyers Table */}
      <div className="bg-white overflow-hidden">
        <div className="">
          <h3 className="text-[#000000] INT500 font-medium text-[16px] leading-[24px] tracking-[-1.5%]">
            Top Engaging Buyers
          </h3>
        </div>
        <UserTable
          data={topBuyers}
          columns={columns}
          placeholder="Search buyers..."
        />
      </div>
    </div>
  );
};

export default BuyersPage;
