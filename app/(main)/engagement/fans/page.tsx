"use client";

import { TableSkeletonRows } from "@/components/engagement/LoadingSkeleton";
import PaginationFooter from "@/components/engagement/PaginationFooter";
import SortButton from "@/components/engagement/SortButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/useDebounce";
import {
  fetchFanDirectory,
  getFanEngagementErrorMessage,
} from "@/lib/fanEngagement";
import { FanDirectoryResponse, SortOrder } from "@/types/engagement";
import { formatDecimalCurrency } from "@/utils/engagement";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

const FanDirectoryPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);
  const [sortDirection, setSortDirection] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [fans, setFans] =
    useState<FanDirectoryResponse["fans"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadFans = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchFanDirectory(
          {
            page,
            per_page: PAGE_SIZE,
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
            sort_by: "current_month_earnings",
            sort_order: sortDirection,
          },
          controller.signal,
        );
        setFans(response.fans);
      } catch (requestError) {
        if (isAbortError(requestError)) return;
        setError(getFanEngagementErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadFans();
    return () => controller.abort();
  }, [debouncedSearch, page, reloadKey, sortDirection]);

  const rows = fans?.docs ?? [];
  const currency = fans?.currency ?? "USD";

  return (
    <main className="mx-auto w-full space-y-6 bg-white pb-10">
      <header>
        <h1 className="text-[24px] leading-8 tracking-[-1.5%] text-[#111810] INT500">
          Fan Directory
        </h1>
        <p className="mt-1 text-[14px] leading-6 tracking-[-1.5%] text-[#A8A8A8]">
          Paginated, sortable, filterable master list of all registered fans.
        </p>
      </header>

      <label className="flex h-10 w-full max-w-[350px] items-center gap-2 rounded-md bg-[#F7F7F7] px-3 text-[#A4A4A4]">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search fans</span>
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          maxLength={100}
          placeholder="Search..."
          className="h-full w-full bg-transparent text-sm text-[#111810] outline-none placeholder:text-[#A4A4A4]"
        />
      </label>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-md border border-[#F5C2C0] bg-[#FFF7F7] px-4 py-3 text-sm text-[#A72B26]"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="shrink-0 font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {error && !fans ? null : (
        <section>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead className="bg-[#F7F7F7] text-[14px] leading-6 tracking-[-1.5%] text-[#808080]">
                <tr>
                  <th className="px-4 py-3 font-normal">Fan</th>
                  <th className="px-4 py-3 font-normal">
                    <SortButton
                      label="Total MTD"
                      direction={sortDirection}
                      onClick={() => {
                        setPage(1);
                        setSortDirection((current) =>
                          current === "desc" ? "asc" : "desc",
                        );
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 font-normal">All time</th>
                  <th className="px-4 py-3 font-normal">Last active</th>
                  <th className="px-4 py-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEEEE]">
                {loading ? (
                  <TableSkeletonRows rows={PAGE_SIZE} columns={5} />
                ) : rows.map((fan) => {
                  const name = fan.name?.trim() || "Unknown fan";
                  const username = fan.username?.trim();

                  return (
                    <tr
                      key={fan.user_id}
                      className="text-[14px] leading-[20px] text-[#5B5B5B] hover:bg-[#FCFCFC] INT400"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={fan.image || undefined}
                              alt={name}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-[14px] leading-[20px] tracking-[-1.5%] text-[#373737] INT500">
                              {name}
                            </p>
                            <p className="mt-0.5 text-[14px] leading-[20px] tracking-[-1.8%] text-[#A4A4A4]">
                              {username
                                ? `@${username.replace(/^@/, "")}`
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#373737] INT500">
                        {formatDecimalCurrency(
                          fan.current_month_earnings,
                          currency,
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {formatDecimalCurrency(fan.all_time_earnings, currency)}
                      </td>
                      <td className="px-4 py-4">
                        {fan.last_active_at
                          ? dateFormatter.format(new Date(fan.last_active_at))
                          : "Never"}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/engagement/fans/${fan.user_id}`}
                          className="font-medium text-[#F75803] hover:underline"
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!loading && rows.length === 0 && (
              <div className="flex min-h-40 items-center justify-center border-b border-[#EEEEEE] text-[14px] text-[#808080] INT500">
                No fans match your search.
              </div>
            )}
          </div>

          <PaginationFooter
            page={fans?.page ?? page}
            pageSize={fans?.limit ?? PAGE_SIZE}
            total={fans?.totalDocs ?? 0}
            onPageChange={setPage}
          />
        </section>
      )}
    </main>
  );
};

export default FanDirectoryPage;
