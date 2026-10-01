"use client";

import { OverviewSkeleton } from "@/components/engagement/LoadingSkeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FanEngagementApiError,
  fetchFanEngagementOverview,
  getFanEngagementErrorMessage,
} from "@/lib/fanEngagement";
import {
  FanEngagementOverviewRequest,
  FanEngagementOverviewResponse,
} from "@/types/engagement";
import {
  decimalToChartValue,
  engagementActivityLabels,
  formatDecimalCurrency,
  getInclusiveUtcDateRange,
} from "@/utils/engagement";
import { ChevronDown, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 0,
});

const dateFilters = [
  { value: "today", label: "Today", days: 1 },
  { value: "last-7-days", label: "Last 7 days", days: 7 },
  { value: "last-30-days", label: "Last 30 days", days: 30 },
  { value: "last-90-days", label: "Last 90 days", days: 90 },
  { value: "custom", label: "Custom range", days: null },
] as const;

const chartColors = ["#28A95B", "#D99A0A", "#F06421", "#3F6EE8", "#064B9B"];
const fanColors = [
  "#4F6EF7",
  "#F06421",
  "#2BAC62",
  "#D63B32",
  "#164B98",
  "#A43D0A",
  "#9D55E5",
  "#D99A0A",
  "#2AA88C",
  "#E83783",
];

type DateFilter = (typeof dateFilters)[number]["value"];

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

const EngagementOverviewPage = () => {
  const initialRange = useMemo(() => getInclusiveUtcDateRange(7), []);
  const [overview, setOverview] =
    useState<FanEngagementOverviewResponse["overview"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<DateFilter>("last-7-days");
  const [pendingFilter, setPendingFilter] = useState<DateFilter>("last-7-days");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedRequest, setAppliedRequest] =
    useState<FanEngagementOverviewRequest>(initialRange);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadOverview = async () => {
      setLoading(true);
      setPageError(null);

      try {
        const response = await fetchFanEngagementOverview(
          appliedRequest,
          controller.signal,
        );
        setOverview(response.overview);
        setFilterError(null);
      } catch (error) {
        if (isAbortError(error)) return;

        const message = getFanEngagementErrorMessage(error);
        if (error instanceof FanEngagementApiError && error.status === 400) {
          setFilterError(message);
          setFilterOpen(true);
        } else {
          setPageError(message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadOverview();
    return () => controller.abort();
  }, [appliedRequest, reloadKey]);

  const appliedFilterLabel =
    dateFilters.find((filter) => filter.value === appliedFilter)?.label ??
    "Last 7 days";
  const currency = overview?.currency ?? "USD";
  const topFans = overview?.top_fans ?? [];
  const highestEarning = topFans.reduce<number>((highest, fan) => {
    const amount = decimalToChartValue(fan.reward_earnings) ?? 0;
    return amount > highest ? amount : highest;
  }, 0);
  const distribution = (overview?.reward_distribution ?? []).map(
    (item, index) => ({
      name: engagementActivityLabels[item.activity],
      value: item.percentage,
      color: chartColors[index % chartColors.length],
    }),
  );

  const metrics = [
    {
      label: "Active fans",
      value: compactNumber.format(overview?.stats.active_fans ?? 0),
    },
    {
      label: "Total Rewards Accrued",
      value: formatDecimalCurrency(
        overview?.stats.total_rewards_accrued ?? "0",
        currency,
      ),
    },
    {
      label: "Total Payouts Processed",
      value: formatDecimalCurrency(
        overview?.stats.total_payout_processed ?? "0",
        currency,
      ),
    },
  ];

  const applyFilter = () => {
    setFilterError(null);
    let request: FanEngagementOverviewRequest;

    if (pendingFilter === "custom") {
      if (!customFrom || !customTo) {
        setFilterError("Select both a start date and an end date.");
        return;
      }
      if (customFrom > customTo) {
        setFilterError("Start date must not be after end date.");
        return;
      }
      request = { start_date: customFrom, end_date: customTo };
    } else {
      const selected = dateFilters.find(
        (filter) => filter.value === pendingFilter,
      );
      request = getInclusiveUtcDateRange(selected?.days ?? 7);
    }

    setAppliedFilter(pendingFilter);
    setAppliedRequest(request);
    setFilterOpen(false);
  };

  return (
    <main className="mx-auto w-full space-y-8 bg-[#FFFFFF] pb-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] leading-8 text-[#111810] INT500">
            Engagement Overview
          </h1>
          <p className="mt-1 text-[14px] leading-6 text-[#A4A4A4] INT400">
            Monitor fan activity, rewards distribution, and platform health.
          </p>
        </div>

        <Popover
          open={filterOpen}
          onOpenChange={(open) => {
            setFilterOpen(open);
            if (open) {
              setPendingFilter(appliedFilter);
              setFilterError(null);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-[4px] border border-[#F1F1F1] bg-white px-3 text-[14px] leading-6 tracking-[-1.8%] text-[#5B5B5B] transition hover:bg-[#FAFAFA] INT400"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7.49996 0.833984V2.50065H12.5V0.833984H14.1666V2.50065H17.5C17.9602 2.50065 18.3333 2.87375 18.3333 3.33398V16.6673C18.3333 17.1276 17.9602 17.5007 17.5 17.5007H2.49996C2.03973 17.5007 1.66663 17.1276 1.66663 16.6673V3.33398C1.66663 2.87375 2.03973 2.50065 2.49996 2.50065H5.83329V0.833984H7.49996ZM16.6666 9.16732H3.33329V15.834H16.6666V9.16732ZM5.83329 4.16732H3.33329V7.50065H16.6666V4.16732H14.1666V5.83398H12.5V4.16732H7.49996V5.83398H5.83329V4.16732Z"
                  fill="#5B5B5B"
                />
              </svg>
              <span>{appliedFilterLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={5}
            className="w-[220px] rounded-[4px] border border-[#F1F1F1] bg-[#FFFFFF] p-0 shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
          >
            <div className="px-3 pb-2 pt-3">
              <p className="mb-2 text-[12px] uppercase leading-4 tracking-[6%] text-[#A4A4A4] INT500">
                Date filter
              </p>
              <div className="space-y-2">
                {dateFilters.map((filter) => (
                  <label
                    key={filter.value}
                    className="flex cursor-pointer items-center gap-2 text-[14px] leading-5 tracking-[-1.5%] text-[#111810]"
                  >
                    <input
                      type="radio"
                      name="engagement-date-filter"
                      value={filter.value}
                      checked={pendingFilter === filter.value}
                      onChange={() => setPendingFilter(filter.value)}
                      className="h-3 w-3 accent-[#F75803]"
                    />
                    {filter.label}
                  </label>
                ))}
              </div>

              {pendingFilter === "custom" && (
                <div className="mt-3 grid gap-2 border-t border-[#EEEEEE] pt-3">
                  <label className="grid gap-1 text-[10px] uppercase leading-4 tracking-[6%] text-[#A4A4A4] INT500">
                    From
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(event) => setCustomFrom(event.target.value)}
                      className="h-8 rounded border border-[#F1F1F1] px-2 text-xs normal-case tracking-normal text-[#292929] outline-none focus:border-[#F75803]"
                    />
                  </label>
                  <label className="grid gap-1 text-[10px] uppercase leading-4 tracking-[6%] text-[#A4A4A4] INT500">
                    To
                    <input
                      type="date"
                      value={customTo}
                      min={customFrom || undefined}
                      onChange={(event) => setCustomTo(event.target.value)}
                      className="h-8 rounded border border-[#F1F1F1] px-2 text-xs normal-case tracking-normal text-[#292929] outline-none focus:border-[#F75803]"
                    />
                  </label>
                </div>
              )}

              {filterError && (
                <p role="alert" className="mt-2 text-xs leading-4 text-[#D83931]">
                  {filterError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#F1F1F1] px-3 py-2.5">
              <button
                type="button"
                onClick={() => {
                  setPendingFilter(appliedFilter);
                  setFilterError(null);
                  setFilterOpen(false);
                }}
                className="h-8 rounded border border-[#F1F1F1] px-3 text-[14px] leading-5 tracking-[-1.5%] text-[#808080] hover:bg-[#FAFAFA] INT500"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={applyFilter}
                className="h-8 rounded bg-[#F75803] px-4 text-[14px] leading-5 tracking-[-1.5%] text-white hover:bg-[#E65002] disabled:cursor-not-allowed disabled:opacity-50 INT500"
              >
                Apply
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </header>

      {pageError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-md border border-[#F5C2C0] bg-[#FFF7F7] px-4 py-3 text-sm text-[#A72B26]"
        >
          <span>{pageError}</span>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="shrink-0 font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <OverviewSkeleton />
      ) : pageError && !overview ? null : (
        <>
          <section className="grid gap-5 sm:grid-cols-3">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={
                  index === 0 ? "" : "sm:border-l sm:border-[#EEEEEE] sm:pl-5"
                }
              >
                <div className="flex items-center gap-1.5 text-[14px] leading-6 tracking-[-1.8%] text-[#5B5B5B] INT400">
                  <span>{metric.label}</span>
                  <UsersRound className="h-4 w-4 text-[#F75803]" />
                </div>
                <p className="mt-1 text-[28px] leading-8 text-[#111810] INT500">
                  {metric.value}
                </p>
              </div>
            ))}
          </section>

          <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.85fr)]">
            <article className="rounded-[8px] border border-[#E4E4E4] bg-white p-5">
              <h2 className="mb-5 text-[16px] leading-6 tracking-[-1.5%] text-[#000000] INT500">
                Top 10 Fans by earnings
              </h2>
              {topFans.length === 0 ? (
                <div className="flex min-h-[240px] items-center justify-center text-sm text-[#808080]">
                  No fan earnings found for this period.
                </div>
              ) : (
                <div className="space-y-4">
                  {topFans.map((fan, index) => {
                    const earnings = decimalToChartValue(fan.reward_earnings);
                    const width =
                      earnings !== null && highestEarning > 0
                        ? (earnings / highestEarning) * 100
                        : 0;

                    return (
                      <div
                        key={`${fan.username ?? "unknown"}-${index}`}
                        className="grid grid-cols-[110px_minmax(100px,1fr)_64px] items-center gap-4 text-[14px] leading-5 tracking-[-1.5%] INT400"
                      >
                        <span className="truncate text-[#808080]">
                          {fan.username ? `@${fan.username.replace(/^@/, "")}` : "—"}
                        </span>
                        <div className="h-4 w-full overflow-hidden rounded bg-[#E4E4E4]">
                          {width > 0 && (
                            <div
                              className="relative h-full rounded-l"
                              style={{
                                backgroundColor: fanColors[index % fanColors.length],
                                width: `${Math.max(8, width)}%`,
                              }}
                            >
                              <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                  backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 5px, #FFFFFF 3px, #FFFFFF 8px)`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <span className="text-right text-[14px] text-[#111810] INT600">
                          {formatDecimalCurrency(fan.reward_earnings, currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="rounded-[8px] border border-[#E4E4E4] bg-white p-5">
              <h2 className="text-[16px] leading-6 tracking-[-1.5%] text-[#000000] INT500">
                Reward Distribution by Activity
              </h2>
              {distribution.some((item) => item.value > 0) ? (
                <>
                  <div className="mx-auto h-[230px] max-w-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={88}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {distribution.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="divide-y divide-[#EEEEEE]">
                    {distribution.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between py-3 text-[16px] leading-6 tracking-[-1.5%] INT500"
                      >
                        <div className="flex items-center gap-2 text-[#808080]">
                          <span
                            className="h-4 w-1 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-[16px] leading-6 tracking-[-1.5%] text-[#111810] INT500">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex min-h-[390px] items-center justify-center text-center text-sm text-[#808080]">
                  No reward activity found for this period.
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
};

export default EngagementOverviewPage;
