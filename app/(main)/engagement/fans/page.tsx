"use client";

import PaginationFooter from "@/components/engagement/PaginationFooter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { engagementFans } from "@/mock/engagement";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type SortDirection = "asc" | "desc";

const FanDirectoryPage = () => {
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  const filteredFans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return engagementFans
      .filter(
        (fan) =>
          !query ||
          fan.name.toLowerCase().includes(query) ||
          fan.username.toLowerCase().includes(query),
      )
      .sort((first, second) =>
        sortDirection === "desc"
          ? second.totalMtd - first.totalMtd
          : first.totalMtd - second.totalMtd,
      );
  }, [search, sortDirection]);

  useEffect(() => {
    setPage(1);
  }, [search, sortDirection]);

  const visibleFans = filteredFans.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <main className="mx-auto w-full max-w-[1180px] space-y-6 pb-10">
      <header>
        <h1 className="text-[24px] font-medium leading-8 text-[#111810]">
          Fan Directory
        </h1>
        <p className="mt-1 text-sm text-[#A4A4A4]">
          Paginated, sortable, filterable master list of all registered fans.
        </p>
      </header>

      <label className="flex h-10 w-full max-w-[350px] items-center gap-2 rounded-md bg-[#F7F7F7] px-3 text-[#A4A4A4]">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search fans</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search..."
          className="h-full w-full bg-transparent text-sm text-[#111810] outline-none placeholder:text-[#A4A4A4]"
        />
      </label>

      <section>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-[#F7F7F7] text-xs font-normal text-[#808080]">
              <tr>
                <th className="px-4 py-3 font-normal">Fan</th>
                <th className="px-4 py-3 font-normal">
                  <button
                    type="button"
                    onClick={() =>
                      setSortDirection((current) =>
                        current === "desc" ? "asc" : "desc",
                      )
                    }
                    className="flex items-center gap-1.5"
                  >
                    Total MTD
                    {sortDirection === "desc" ? (
                      <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUp className="h-3.5 w-3.5" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 font-normal">All time</th>
                <th className="px-4 py-3 font-normal">Last active</th>
                <th className="px-4 py-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEEE]">
              {visibleFans.map((fan) => (
                <tr key={fan.id} className="text-[#5F5F5F] hover:bg-[#FCFCFC]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={fan.avatar} alt={fan.name} className="object-cover" />
                        <AvatarFallback>{fan.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#373737]">{fan.name}</p>
                        <p className="mt-0.5 text-xs text-[#A4A4A4]">@{fan.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">{currency.format(fan.totalMtd)}</td>
                  <td className="px-4 py-4">{currency.format(fan.allTime)}</td>
                  <td className="px-4 py-4">{dateFormatter.format(new Date(fan.lastActive))}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/engagement/fans/${fan.id}`}
                      className="font-medium text-[#F75803] hover:underline"
                    >
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleFans.length === 0 && (
            <div className="flex min-h-40 items-center justify-center border-b border-[#EEEEEE] text-sm text-[#808080]">
              No fans match your search.
            </div>
          )}
        </div>

        <PaginationFooter
          page={page}
          pageSize={PAGE_SIZE}
          total={filteredFans.length}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
};

export default FanDirectoryPage;

