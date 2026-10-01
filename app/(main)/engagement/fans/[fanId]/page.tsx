"use client";

import LoadingState from "@/components/LoadingState";
import {
  SkeletonBlock,
  TableSkeletonRows,
} from "@/components/engagement/LoadingSkeleton";
import {
  LastPayoutDateIcon,
  PaidOutIcon,
  PendingPayoutIcon,
} from "@/components/engagement/PayoutSummaryIcons";
import PaginationFooter from "@/components/engagement/PaginationFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminUserDetails, fetchAdminUserDetails } from "@/lib/api";
import {
  FanEngagementApiError,
  fetchFanActivityLog,
  fetchFanPayoutHistory,
  fetchFanRewardBreakdown,
  getFanEngagementErrorMessage,
} from "@/lib/fanEngagement";
import {
  FanActivityLogResponse,
  FanPayoutHistoryResponse,
  FanRewardBreakdownResponse,
  PayoutStatus,
} from "@/types/engagement";
import {
  engagementActivityLabels,
  formatCompactDecimalCurrency,
  formatDecimalCurrency,
} from "@/utils/engagement";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ACTIVITY_PAGE_SIZE = 16;
const PAYOUT_PAGE_SIZE = 5;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const unitFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const rewardColors = ["#2368C4", "#188B68", "#713AB7", "#F75803", "#137F9C"];

type ProfileTab = "activity" | "rewards" | "payouts";

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

const isNotFoundError = (error: unknown) =>
  (error instanceof FanEngagementApiError && error.status === 404) ||
  (error instanceof Error && error.message.includes("status: 404"));

const FanProfilePage = ({ params }: { params: { fanId: string } }) => {
  const userId = Number(params.fanId);
  const validUserId = Number.isInteger(userId) && userId > 0;
  const [activeTab, setActiveTab] = useState<ProfileTab>("activity");
  const [profile, setProfile] = useState<AdminUserDetails | null>(null);
  const [profileLoading, setProfileLoading] = useState(validUserId);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileRetry, setProfileRetry] = useState(0);
  const [notFound, setNotFound] = useState(!validUserId);

  const [activityPage, setActivityPage] = useState(1);
  const [activityLog, setActivityLog] =
    useState<FanActivityLogResponse["activity_log"] | null>(null);
  const [activityLoading, setActivityLoading] = useState(validUserId);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [activityRetry, setActivityRetry] = useState(0);

  const [rewardBreakdown, setRewardBreakdown] =
    useState<FanRewardBreakdownResponse["reward_breakdown"] | null>(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [rewardRetry, setRewardRetry] = useState(0);

  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutCache, setPayoutCache] = useState<
    Record<number, FanPayoutHistoryResponse["payout_history"]>
  >({});
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutRetry, setPayoutRetry] = useState(0);
  const payoutHistory = payoutCache[payoutPage] ?? null;

  useEffect(() => {
    if (!validUserId) return;
    let active = true;

    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);

      try {
        const response = await fetchAdminUserDetails(userId);
        if (active) setProfile(response);
      } catch (error) {
        if (!active) return;
        if (isNotFoundError(error)) {
          setNotFound(true);
        } else {
          setProfileError(
            error instanceof Error ? error.message : "Unable to load fan details",
          );
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [profileRetry, userId, validUserId]);

  useEffect(() => {
    if (!validUserId) return;
    const controller = new AbortController();

    const loadActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);

      try {
        const response = await fetchFanActivityLog(
          {
            user_id: userId,
            page: activityPage,
            per_page: ACTIVITY_PAGE_SIZE,
          },
          controller.signal,
        );
        setActivityLog(response.activity_log);
      } catch (error) {
        if (isAbortError(error)) return;
        if (isNotFoundError(error)) {
          setNotFound(true);
        } else {
          setActivityError(getFanEngagementErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) setActivityLoading(false);
      }
    };

    loadActivity();
    return () => controller.abort();
  }, [activityPage, activityRetry, userId, validUserId]);

  useEffect(() => {
    if (!validUserId || activeTab !== "rewards" || rewardBreakdown) return;
    const controller = new AbortController();

    const loadRewards = async () => {
      setRewardLoading(true);
      setRewardError(null);

      try {
        const response = await fetchFanRewardBreakdown(
          { user_id: userId },
          controller.signal,
        );
        setRewardBreakdown(response.reward_breakdown);
      } catch (error) {
        if (isAbortError(error)) return;
        if (isNotFoundError(error)) {
          setNotFound(true);
        } else {
          setRewardError(getFanEngagementErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) setRewardLoading(false);
      }
    };

    loadRewards();
    return () => controller.abort();
  }, [activeTab, rewardBreakdown, rewardRetry, userId, validUserId]);

  useEffect(() => {
    if (
      !validUserId ||
      activeTab !== "payouts" ||
      payoutHistory
    ) {
      return;
    }
    const controller = new AbortController();

    const loadPayouts = async () => {
      setPayoutLoading(true);
      setPayoutError(null);

      try {
        const response = await fetchFanPayoutHistory(
          {
            user_id: userId,
            page: payoutPage,
            per_page: PAYOUT_PAGE_SIZE,
          },
          controller.signal,
        );
        setPayoutCache((cache) => ({
          ...cache,
          [response.payout_history.page]: response.payout_history,
        }));
      } catch (error) {
        if (isAbortError(error)) return;
        if (isNotFoundError(error)) {
          setNotFound(true);
        } else {
          setPayoutError(getFanEngagementErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) setPayoutLoading(false);
      }
    };

    loadPayouts();
    return () => controller.abort();
  }, [activeTab, payoutHistory, payoutPage, payoutRetry, userId, validUserId]);

  if (notFound) {
    return <MissingFan />;
  }

  if (profileLoading && !profile) {
    return <LoadingState message="Loading fan profile..." className="py-24" />;
  }

  if (profileError && !profile) {
    return (
      <RequestError
        message={profileError}
        onRetry={() => setProfileRetry((key) => key + 1)}
      />
    );
  }

  const name = profile?.full_name?.trim() || profile?.username?.trim() || "Unknown fan";
  const username = profile?.username?.trim();
  const joinedAt = profile?.createdAt ? new Date(profile.createdAt) : null;
  const joinedLabel =
    joinedAt && !Number.isNaN(joinedAt.getTime())
      ? dateFormatter.format(joinedAt)
      : "—";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-7.5rem)] w-full flex-col pb-2">
      <header>
        <Link
          href="/engagement/fans"
          className="mb-3 inline-flex items-center gap-1 text-[14px] leading-5 tracking-[-1.5%] text-[#808080] transition hover:text-[#F75803] INT500"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Fan Directory
        </Link>
        <h1 className="text-[24px] leading-8 tracking-[-1.5%] text-[#111810] INT500">
          Fan Profile Details
        </h1>
        <p className="mt-1 text-[14px] leading-6 tracking-[-1.5%] text-[#A8A8A8]">
          Examine individual rewards ledger, compliance, and user logs.
        </p>
      </header>

      <section className="mt-5 rounded-[12px] border border-[#DADDE6] px-5 py-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={profile?.image || undefined}
              alt={name}
              className="object-cover"
            />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-[20px] leading-8 text-[#111810] INT500">{name}</h2>
              <span className="text-[14px] leading-6 tracking-[-1.5%] text-[#5B5B5B] INT500">
                {username ? `@${username.replace(/^@/, "")}` : "—"}
              </span>
            </div>
            <p className="mt-1 text-[14px] leading-6 tracking-[-1.5%] text-[#808080] INT400">
              Email: {profile?.email || "—"}
              <span className="mx-2 text-[#808080]">|</span>
              Joined: {joinedLabel}
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
              className={`whitespace-nowrap border-b px-0 py-3 text-[16px] leading-6 tracking-[-1.5%] transition INT500 ${
                activeTab === value
                  ? "border-[#F75803] text-[#111810]"
                  : "border-transparent text-[#A4A4A4]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          {activeTab === "activity" && (
            <ActivityTable
              activityLog={activityLog}
              loading={activityLoading}
              error={activityError}
              onRetry={() => setActivityRetry((key) => key + 1)}
            />
          )}

          {activeTab === "rewards" && (
            <RewardPanel
              rewardBreakdown={rewardBreakdown}
              loading={rewardLoading}
              error={rewardError}
              onRetry={() => {
                setRewardBreakdown(null);
                setRewardRetry((key) => key + 1);
              }}
            />
          )}

          {activeTab === "payouts" && (
            <PayoutPanel
              payoutHistory={payoutHistory}
              loading={payoutLoading}
              error={payoutError}
              onRetry={() => setPayoutRetry((key) => key + 1)}
            />
          )}
        </div>

        {activeTab === "activity" && activityLog && !activityError && (
          <div className="mt-auto">
            <PaginationFooter
              page={activityLog.page}
              pageSize={activityLog.limit}
              total={activityLog.totalDocs}
              onPageChange={setActivityPage}
            />
          </div>
        )}
        {activeTab === "payouts" && payoutHistory && !payoutError && (
          <div className="mt-auto">
            <PaginationFooter
              page={payoutHistory.page}
              pageSize={payoutHistory.limit}
              total={payoutHistory.totalDocs}
              onPageChange={setPayoutPage}
            />
          </div>
        )}
      </section>
    </main>
  );
};

interface ActivityTableProps {
  activityLog: FanActivityLogResponse["activity_log"] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const ActivityTable = ({
  activityLog,
  loading,
  error,
  onRetry,
}: ActivityTableProps) => {
  if (loading) return <ActivityTableSkeleton />;
  if (error) return <RequestError message={error} onRetry={onRetry} />;
  if (!activityLog || activityLog.docs.length === 0) {
    return <EmptyState message="No activity found for this fan." />;
  }

  return (
    <table className="w-full min-w-[720px] border-collapse text-left text-sm">
      <thead className="bg-[#F7F7F7] text-[14px] leading-5 tracking-[-1.5%] text-[#808080] INT500">
        <tr>
          <th className="px-4 py-3 font-normal">Activity type</th>
          <th className="px-4 py-3 font-normal">Timestamp</th>
          {/* Context / Link is intentionally hidden because the API does not return it. */}
          <th className="px-4 py-3 font-normal">Units</th>
          <th className="px-4 py-3 font-normal">Eligible</th>
          <th className="px-4 py-3 font-normal">Reward</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#EEEEEE] text-[14px] leading-[20px] text-[#5B5B5B] INT400">
        {activityLog.docs.map((row, index) => (
          <tr key={`${row.time}-${row.activity}-${index}`}>
            <td className="px-4 py-5 text-[#373737] INT500">
              {engagementActivityLabels[row.activity]}
            </td>
            <td className="px-4 py-5">{dateTimeFormatter.format(new Date(row.time))}</td>
            <td className="px-4 py-5">
              {unitFormatter.format(row.units)} {row.unit_type}
            </td>
            <td className="px-4 py-5">{unitFormatter.format(row.eligible)}</td>
            <td className="px-4 py-5 text-[#373737]">
              {formatDecimalCurrency(row.reward, "USD", 2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

interface RewardPanelProps {
  rewardBreakdown: FanRewardBreakdownResponse["reward_breakdown"] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const RewardPanel = ({
  rewardBreakdown,
  loading,
  error,
  onRetry,
}: RewardPanelProps) => {
  if (loading) return <RewardPanelSkeleton />;
  if (error) return <RequestError message={error} onRetry={onRetry} />;
  if (!rewardBreakdown) return null;

  return (
    <div className="grid min-w-[680px] grid-cols-[minmax(0,1.85fr)_minmax(230px,1fr)] gap-5">
      <section className="rounded-[12px] border border-[#E4E4E4] px-4 py-4">
        <h3 className="text-[16px] leading-6 tracking-[-1.5%] text-[#000000] INT500">
          Active Ledger Projections
        </h3>
        <div className="mt-2 divide-y divide-[#EEEEEE]">
          {rewardBreakdown.breakdown.map((reward, index) => (
            <div
              key={reward.activity}
              className="flex items-start justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[14px] leading-5 tracking-[-1.5%] text-[#111810] INT600">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: rewardColors[index % rewardColors.length] }}
                  />
                  {engagementActivityLabels[reward.activity]}
                </p>
                {reward.rate_segments.length === 0 ? (
                  <p className="mt-1 text-[14px] leading-5 tracking-[-1.5%] text-[#808080] INT400">
                    No eligible activity for this period
                  </p>
                ) : (
                  reward.rate_segments.map((segment, segmentIndex) => (
                    <p
                      key={`${reward.activity}-${segmentIndex}`}
                      className="mt-1 text-[14px] leading-5 tracking-[-1.5%] text-[#808080] INT400"
                    >
                      {unitFormatter.format(segment.eligible_units)} eligible /{" "}
                      {unitFormatter.format(segment.threshold_units)} ×{" "}
                      {formatDecimalCurrency(
                        segment.reward_amount,
                        rewardBreakdown.currency,
                        2,
                      )}{" "}
                      ={" "}
                      {formatDecimalCurrency(
                        segment.reward,
                        rewardBreakdown.currency,
                        2,
                      )}
                    </p>
                  ))
                )}
              </div>
              <p className="shrink-0 text-[14px] leading-5 tracking-[-1.5%] text-[#111810] INT600">
                {formatDecimalCurrency(
                  reward.reward,
                  rewardBreakdown.currency,
                  2,
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      <aside className="flex h-[116px] flex-col items-center justify-center rounded-xl bg-[#FEECE3] px-5 text-center">
        <p className="flex items-center gap-1.5 text-[13px] leading-[100%] tracking-[-1.5%] text-[#111810] INT600">
          TOTAL MTD
          <Info className="h-3.5 w-3.5" />
        </p>
        <p className="mt-2 text-[48px] leading-none text-[#111810] INT700">
          {formatDecimalCurrency(
            rewardBreakdown.mtd_earnings,
            rewardBreakdown.currency,
            2,
          )}
        </p>
      </aside>
    </div>
  );
};

interface PayoutPanelProps {
  payoutHistory: FanPayoutHistoryResponse["payout_history"] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const PayoutPanel = ({
  payoutHistory,
  loading,
  error,
  onRetry,
}: PayoutPanelProps) => {
  if (loading) return <PayoutPanelSkeleton />;
  if (error) return <RequestError message={error} onRetry={onRetry} />;
  if (!payoutHistory) return null;

  const { currency, docs, stats } = payoutHistory;

  return (
    <div className={`min-w-[760px] ${loading ? "opacity-60" : ""}`}>
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Total paid out"
          value={formatCompactDecimalCurrency(stats.total_paid_out, currency)}
          icon={<PaidOutIcon className="h-4 w-4" />}
        />
        <SummaryCard
          label="Pending payout"
          value={formatCompactDecimalCurrency(stats.pending_payout, currency)}
          icon={<PendingPayoutIcon className="h-4 w-4" />}
        />
        <SummaryCard
          label="Last payout date"
          value={
            stats.last_payout_date
              ? dateFormatter.format(new Date(stats.last_payout_date))
              : "—"
          }
          icon={<LastPayoutDateIcon className="h-4 w-4" />}
          compact
        />
      </div>

      <table className="mt-5 w-full border-collapse text-left text-sm">
        <thead className="bg-[#F7F7F7] text-[14px] leading-5 tracking-[-1.5%] text-[#808080] INT500">
          <tr>
            <th className="px-3 py-3 font-normal">Amount withdrawn</th>
            <th className="px-3 py-3 font-normal">Status</th>
            <th className="px-3 py-3 font-normal">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEEEEE] text-[14px] leading-[20px] text-[#808080] INT400">
          {docs.map((row) => {
            const payoutDate = row.completed_at ?? row.created_at;
            return (
              <tr key={row.payout_id}>
                <td className="px-3 py-5 text-[#373737] INT500">
                  {formatDecimalCurrency(row.amount, currency)}
                </td>
                <td className="px-3 py-5">
                  <PayoutBadge status={row.status} />
                </td>
                <td className="px-3 py-5 text-[#808080]">
                  {dateFormatter.format(new Date(payoutDate))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!loading && docs.length === 0 && (
        <EmptyState message="No payouts match the current selection." />
      )}
    </div>
  );
};

const PayoutBadge = ({ status }: { status: PayoutStatus }) => {
  const className =
    status === "completed"
      ? "bg-[#2BAC47]"
      : status === "failed"
        ? "bg-[#D83931]"
        : "bg-[#D98C00]";

  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-[10px] font-medium uppercase tracking-[0.05em] text-white ${className}`}
    >
      {status}
    </span>
  );
};

const ActivityTableSkeleton = () => (
  <table
    aria-label="Loading activity log"
    className="w-full min-w-[720px] border-collapse text-left text-sm"
  >
    <thead className="bg-[#F7F7F7] text-[14px] leading-5 text-[#808080]">
      <tr>
        <th className="px-4 py-3 font-normal">Activity type</th>
        <th className="px-4 py-3 font-normal">Timestamp</th>
        <th className="px-4 py-3 font-normal">Units</th>
        <th className="px-4 py-3 font-normal">Eligible</th>
        <th className="px-4 py-3 font-normal">Reward</th>
      </tr>
    </thead>
    <tbody>
      <TableSkeletonRows rows={8} columns={5} />
    </tbody>
  </table>
);

const RewardPanelSkeleton = () => (
  <div
    aria-label="Loading reward breakdown"
    className="grid min-w-[680px] grid-cols-[minmax(0,1.85fr)_minmax(230px,1fr)] gap-5"
  >
    <section className="rounded-[12px] border border-[#E4E4E4] px-4 py-4">
      <SkeletonBlock className="h-6 w-48" />
      <div className="mt-4 space-y-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-4 w-56" />
            </div>
            <SkeletonBlock className="h-5 w-16" />
          </div>
        ))}
      </div>
    </section>
    <SkeletonBlock className="h-[116px] rounded-xl" />
  </div>
);

const PayoutPanelSkeleton = () => (
  <div aria-label="Loading payout history" className="min-w-[760px]">
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="min-h-[92px] rounded-md border border-[#E4E4E4] bg-[#F7F7F7] px-5 py-4"
        >
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="mt-3 h-8 w-24" />
        </div>
      ))}
    </div>
    <table className="mt-5 w-full border-collapse text-left text-sm">
      <thead className="bg-[#F7F7F7] text-[14px] leading-5 text-[#808080]">
        <tr>
          <th className="px-3 py-3 font-normal">Amount withdrawn</th>
          <th className="px-3 py-3 font-normal">Status</th>
          <th className="px-3 py-3 font-normal">Date</th>
        </tr>
      </thead>
      <tbody>
        <TableSkeletonRows rows={PAYOUT_PAGE_SIZE} columns={3} />
      </tbody>
    </table>
  </div>
);

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  compact?: boolean;
}

const SummaryCard = ({ label, value, icon, compact = false }: SummaryCardProps) => (
  <article className="min-h-[92px] rounded-md border border-[#E4E4E4] bg-[#F7F7F7] px-5 py-4">
    <p className="flex items-center gap-1.5 text-[14px] leading-5 tracking-[-1.5%] text-[#5B5B5B] INT400">
      {label}
      <span className="text-[#F75803]">{icon}</span>
    </p>
    <p
      className={`mt-2 leading-8 text-[#111810] INT500 ${
        compact ? "text-[28px]" : "text-2xl"
      }`}
    >
      {value}
    </p>
  </article>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex min-h-40 items-center justify-center border-b border-[#EEEEEE] text-sm text-[#808080]">
    {message}
  </div>
);

const RequestError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div
    role="alert"
    className="flex min-h-40 items-center justify-center gap-4 rounded-md border border-[#F5C2C0] bg-[#FFF7F7] px-4 text-sm text-[#A72B26]"
  >
    <span>{message}</span>
    <button type="button" onClick={onRetry} className="font-medium underline">
      Try again
    </button>
  </div>
);

const MissingFan = () => (
  <main className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <h1 className="text-2xl font-medium text-[#111810]">Fan not found</h1>
    <p className="mt-2 text-sm text-[#808080]">
      This fan profile is no longer available.
    </p>
    <Link
      href="/engagement/fans"
      className="mt-5 rounded-md bg-[#F75803] px-4 py-2 text-sm font-medium text-white"
    >
      Back to Fan Directory
    </Link>
  </main>
);

export default FanProfilePage;
