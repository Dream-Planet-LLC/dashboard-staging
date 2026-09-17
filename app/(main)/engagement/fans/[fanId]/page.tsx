"use client";

import PaginationFooter from "@/components/engagement/PaginationFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  engagementFans,
  getFanActivities,
  getPayoutHistory,
  getRewardBreakdown,
} from "@/mock/engagement";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CircleDollarSign,
  Info,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 16;
const PAYOUT_PAGE_SIZE = 5;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const preciseCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type ProfileTab = "activity" | "rewards" | "payouts";
type SortDirection = "asc" | "desc";

const rewardPresentation = [
  {
    color: "#2368C4",
    eligible: "4,500 eligible / 1,000",
    rate: 2,
    weight: 9,
  },
  {
    color: "#188B68",
    eligible: "250 eligible / 100",
    rate: 2,
    weight: 5,
  },
  {
    color: "#713AB7",
    eligible: "150 eligible / 100",
    rate: 4,
    weight: 6,
  },
  {
    color: "#F75803",
    eligible: "80 eligible / 100",
    rate: 10,
    weight: 8,
  },
  {
    color: "#137F9C",
    eligible: "25 hours / 10",
    rate: 2,
    weight: 5,
  },
] as const;

const FanProfilePage = ({ params }: { params: { fanId: string } }) => {
  const fan = engagementFans.find((item) => item.id === params.fanId);
  const [activeTab, setActiveTab] = useState<ProfileTab>("activity");
  const [page, setPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const activities = useMemo(
    () => (fan ? getFanActivities(fan.id) : []),
    [fan],
  );
  const rewards = useMemo(
    () => (fan ? getRewardBreakdown(fan.id) : []),
    [fan],
  );
  const payouts = useMemo(
    () => (fan ? getPayoutHistory(fan.id) : []),
    [fan],
  );

  const rewardProjection = useMemo(
    () =>
      rewards.slice(0, rewardPresentation.length).map((reward, index) => {
        const presentation = rewardPresentation[index];
        const amount = fan
          ? (fan.totalMtd * presentation.weight) / 33
          : reward.reward;

        return {
          ...reward,
          amount,
          color: presentation.color,
          detail: `${presentation.eligible} × ${preciseCurrency.format(
            presentation.rate,
          )} = ${preciseCurrency.format(amount)}`,
        };
      }),
    [fan, rewards],
  );

  useEffect(() => {
    setPage(1);
  }, [activeTab, sortDirection]);

  if (!fan) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-medium text-[#111810]">Fan not found</h1>
        <p className="mt-2 text-sm text-[#808080]">
          This mock fan profile does not exist.
        </p>
        <Link
          href="/engagement/fans"
          className="mt-5 rounded-md bg-[#F75803] px-4 py-2 text-sm font-medium text-white"
        >
          Back to Fan Directory
        </Link>
      </main>
    );
  }

  const sortedActivities = [...activities].sort((first, second) =>
    sortDirection === "desc"
      ? new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime()
      : new Date(first.timestamp).getTime() - new Date(second.timestamp).getTime(),
  );
  const sortedPayouts = [...payouts].sort((first, second) =>
    sortDirection === "desc"
      ? new Date(second.date).getTime() - new Date(first.date).getTime()
      : new Date(first.date).getTime() - new Date(second.date).getTime(),
  );

  const activeRows =
    activeTab === "activity"
      ? sortedActivities
      : activeTab === "rewards"
        ? rewardProjection
        : sortedPayouts;
  const activePageSize = activeTab === "payouts" ? PAYOUT_PAGE_SIZE : PAGE_SIZE;
  const visibleRows = activeRows.slice(
    (page - 1) * activePageSize,
    page * activePageSize,
  );

  const totalPaid = payouts
    .filter((payout) => payout.status === "Completed")
    .reduce((total, payout) => total + payout.amount, 0);
  const pendingPayout = payouts
    .filter((payout) => payout.status === "Processing")
    .reduce((total, payout) => total + payout.amount, 0);
  const lastPayoutDate = payouts.reduce<Date | null>((latest, payout) => {
    const currentDate = new Date(payout.date);
    return !latest || currentDate > latest ? currentDate : latest;
  }, null);

  const toggleSort = () =>
    setSortDirection((current) => (current === "desc" ? "asc" : "desc"));

  return (
    <main className="mx-auto flex min-h-[calc(100vh-7.5rem)] w-full max-w-[1180px] flex-col pb-2">
      <header>
        <h1 className="text-[22px] font-medium leading-8 text-[#111810]">
          Fan Profile Details
        </h1>
        <p className="mt-0.5 text-xs text-[#A4A4A4]">
          Examine individual rewards ledger, compliance, and user logs.
        </p>
      </header>

      <section className="mt-5 rounded-xl border border-[#DDE2E8] px-5 py-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={fan.avatar} alt={fan.name} className="object-cover" />
            <AvatarFallback>{fan.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-base font-medium text-[#111810]">{fan.name}</h2>
              <span className="text-xs text-[#4F4F4F]">@{fan.username}</span>
            </div>
            <p className="mt-1 text-xs text-[#8C8C8C]">
              Email: {fan.email}
              <span className="mx-2 text-[#C8C8C8]">|</span>
              Joined: {dateFormatter.format(new Date(fan.joinedAt))}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 flex flex-1 flex-col">
        <div className="flex max-w-[635px] gap-10 overflow-x-auto border-b border-[#E4E4E4]">
          {([
            ["activity", "Activity log"],
            ["rewards", "Reward breakdown"],
            ["payouts", "Payout history"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value)}
              className={`whitespace-nowrap border-b px-0 py-3 text-sm transition ${
                activeTab === value
                  ? "border-[#F75803] font-medium text-[#111810]"
                  : "border-transparent text-[#A4A4A4]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          {activeTab === "activity" && (
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-[#F7F7F7] text-xs text-[#808080]">
                <tr>
                  <th className="px-4 py-3 font-normal">Activity type</th>
                  <th className="px-4 py-3 font-normal">
                    <SortButton label="Timestamp" direction={sortDirection} onClick={toggleSort} />
                  </th>
                  <th className="px-4 py-3 font-normal">Context / Link</th>
                  <th className="px-4 py-3 font-normal">Units</th>
                  <th className="px-4 py-3 font-normal">Eligible</th>
                  <th className="px-4 py-3 font-normal">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEEEE] text-[#5F5F5F]">
                {visibleRows.map((row) => {
                  if (!("timestamp" in row)) return null;
                  return (
                    <tr key={row.id}>
                      <td className="px-4 py-5 text-[#373737]">{row.activityType}</td>
                      <td className="px-4 py-5">{dateTimeFormatter.format(new Date(row.timestamp))}</td>
                      <td className="max-w-[230px] truncate px-4 py-5 text-[#F75803]">{row.context}</td>
                      <td className="px-4 py-5">{row.units}</td>
                      <td className="px-4 py-5">{row.eligible}</td>
                      <td className="px-4 py-5 text-[#373737]">{currency.format(row.reward)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === "rewards" && (
            <div className="grid min-w-[680px] grid-cols-[minmax(0,1.85fr)_minmax(230px,1fr)] gap-5">
              <section className="rounded-xl border border-[#E2E2E2] px-4 py-4">
                <h3 className="text-sm font-medium text-[#1D1D1D]">
                  Active Ledger Projections
                </h3>
                <div className="mt-2 divide-y divide-[#EEEEEE]">
                  {rewardProjection.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium text-[#292929]">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: reward.color }}
                          />
                          {reward.activityType}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#9A9A9A]">
                          {reward.detail}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium text-[#111810]">
                        {preciseCurrency.format(reward.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="flex h-[116px] flex-col items-center justify-center rounded-xl bg-[#FEECE3] px-5 text-center">
                <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.08em] text-[#1D1D1D]">
                  TOTAL MTD
                  <Info className="h-3.5 w-3.5" />
                </p>
                <p className="mt-2 text-[38px] font-medium leading-none text-[#111810]">
                  {preciseCurrency.format(fan.totalMtd)}
                </p>
              </aside>
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="min-w-[760px]">
              <div className="grid grid-cols-3 gap-3">
                <SummaryCard
                  label="Total paid out"
                  value={compactCurrency.format(totalPaid)}
                  icon={<WalletCards className="h-3.5 w-3.5" />}
                />
                <SummaryCard
                  label="Pending payout"
                  value={compactCurrency.format(pendingPayout)}
                  icon={<CircleDollarSign className="h-3.5 w-3.5" />}
                />
                <SummaryCard
                  label="Last payout date"
                  value={lastPayoutDate ? dateFormatter.format(lastPayoutDate) : "—"}
                  icon={<CalendarDays className="h-3.5 w-3.5" />}
                  compact
                />
              </div>

              <table className="mt-4 w-full border-collapse text-left text-sm">
                <thead className="bg-[#F7F7F7] text-xs text-[#808080]">
                  <tr>
                    <th className="px-3 py-3 font-normal">Amount</th>
                    <th className="px-3 py-3 font-normal">
                      <SortButton
                        label="Transaction reference"
                        direction={sortDirection}
                        onClick={toggleSort}
                      />
                    </th>
                    <th className="px-3 py-3 font-normal">Status</th>
                    <th className="px-3 py-3 font-normal">Date</th>
                    <th className="px-3 py-3 font-normal">Payment method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE] text-[#5F5F5F]">
                  {visibleRows.map((row) => {
                    if (!("reference" in row)) return null;
                    return (
                      <tr key={row.id}>
                        <td className="px-3 py-4 font-medium text-[#373737]">
                          {currency.format(row.amount)}
                        </td>
                        <td className="px-3 py-4 text-[#F75803]">{row.reference}</td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              row.status === "Completed"
                                ? "bg-[#EAF8EE] text-[#2BAC47]"
                                : "bg-[#FFF3E8] text-[#D86A00]"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          {dateTimeFormatter.format(new Date(row.date))}
                        </td>
                        <td className="px-3 py-4">Bank transfer</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <PaginationFooter
            page={page}
            pageSize={activePageSize}
            total={activeRows.length}
            onPageChange={setPage}
          />
        </div>
      </section>
    </main>
  );
};

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  compact?: boolean;
}

const SummaryCard = ({ label, value, icon, compact = false }: SummaryCardProps) => (
  <article className="rounded-md border border-[#E4E4E4] bg-[#FAFAFA] px-4 py-4">
    <p className="flex items-center gap-1.5 text-xs text-[#919191]">
      {label}
      <span className="text-[#F75803]">{icon}</span>
    </p>
    <p
      className={`mt-2 font-medium leading-none text-[#454545] ${
        compact ? "text-lg" : "text-2xl"
      }`}
    >
      {value}
    </p>
  </article>
);

interface SortButtonProps {
  label: string;
  direction: SortDirection;
  onClick: () => void;
}

const SortButton = ({ label, direction, onClick }: SortButtonProps) => (
  <button type="button" onClick={onClick} className="flex items-center gap-1.5">
    {label}
    {direction === "desc" ? (
      <ArrowDown className="h-3.5 w-3.5" />
    ) : (
      <ArrowUp className="h-3.5 w-3.5" />
    )}
  </button>
);

export default FanProfilePage;
