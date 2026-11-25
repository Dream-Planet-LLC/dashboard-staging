"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DesignIcon } from "./DesignIcon";
import { SalesSelect } from "./SalesSelect";
import { listingCategories } from "@/mock/listings";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useListings } from "./ListingsProvider";
import { MediaPreview, money, salesButton, salesOutlineButton, SalesPagination, SalesSearch, StatusBadge } from "./SalesPrimitives";
import { Listing } from "@/types/listings";
import { cn } from "@/lib/utils";

export default function ListingsPage() {
  const { listings, setStatus, deleteListing } = useListings();
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sort, setSort] = useState<{ key: "stock" | "status"; direction: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Listing | null>(null);
  const pageSize = 16;
  const categories = Array.from(new Set([...listingCategories, ...listings.map((item) => item.category)])).sort();

  const filtered = useMemo(() => {
    const result = listings.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())
      && (status === "all" || item.status === status)
      && (category === "all" || item.category === category));
    if (sort) result.sort((a, b) => (sort.key === "stock" ? a.stock - b.stock : a.status.localeCompare(b.status)) * (sort.direction === "asc" ? 1 : -1));
    return result;
  }, [listings, query, status, category, sort]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key: "stock" | "status") => {
    setSort((current) => ({ key, direction: current?.key === key && current.direction === "asc" ? "desc" : "asc" }));
    setPage(1);
  };
  const sortIcon = (_key: "stock" | "status") => <DesignIcon name="sort" size={16} />;

  const actions = (listing: Listing, onImage = false) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={`Actions for ${listing.name}`} className={cn("inline-flex items-center justify-center text-[#5B5B5B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F75803]", onImage ? "h-6 w-6 rounded-full bg-white" : "h-5 w-5")} >{onImage ? <DesignIcon name="dots" size={14} /> : <DesignIcon name="more-vertical" size={20} />}</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="INT400 w-[172px] space-y-2 rounded-[5px] border-[#F1F1F1] bg-white px-2 py-3 text-[#373737]">
        <DropdownMenuItem asChild><Link href={`/listings/${listing.id}/edit`} className="flex items-center gap-3"><img src="/DASHBOARDASSETS/ICONS/EDIT.svg" alt="" aria-hidden="true" width={20} height={20} className="h-5 w-5 shrink-0" />Edit product</Link></DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setStatus(listing.id, listing.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE")} className="flex items-center gap-3">
          <DesignIcon name="archive" size={20} />
          {listing.status === "ACTIVE" ? "Archive" : "Publish"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setPendingDelete(listing)} className="flex items-center gap-3 text-[#C83532] focus:text-[#C83532]"><DesignIcon name="trash-red" size={20} />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="INT400 flex min-h-[calc(100vh-136px)] flex-col gap-5 pb-4 text-[14px] leading-6 lg:min-h-[874px]">
      <header>
        <h1 className="text-[24px] font-medium leading-8 tracking-[-0.015em] text-[#111810]">Listings</h1>
        <p className="mt-0.5 leading-6 tracking-[-0.018em] text-[#A8A8A8]">Items published for creators to list for their fans</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full flex-wrap items-center gap-4 sm:w-auto">
          <SalesSearch value={query} onChange={(value) => { setQuery(value); setPage(1); }} />
          <SalesSelect value={status} onChange={(value) => { setStatusFilter(value); setPage(1); }} label="Filter by status" className="w-[100px]" options={[{ value: "all", label: "All Status" }, { value: "ACTIVE", label: "Active" }, { value: "ARCHIVED", label: "Archived" }, { value: "DRAFT", label: "Draft" }]} />
          <SalesSelect value={category} onChange={(value) => { setCategory(value); setPage(1); }} label="Filter by category" className="w-[130px]" options={[{ value: "all", label: "All Categories" }, ...categories.map((value) => ({ value, label: value }))]} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded">
            {(["list", "grid"] as const).map((mode) => <button key={mode} aria-label={`${mode === "list" ? "List" : "Grid"} view`} aria-pressed={view === mode} onClick={() => setView(mode)} className={cn("flex h-8 w-10 items-center justify-center transition-colors", view === mode ? "bg-[#FFEEE6] text-[#F75803]" : "bg-[#F1F1F1] text-[#5B5B5B] hover:bg-[#E4E4E4]")}><DesignIcon name={mode} size={mode === "list" ? 15 : 16.67} color={view === mode ? "#F75803" : "#5B5B5B"} /></button>)}
          </div>
          <Link href="/listings/new" className={salesButton}><DesignIcon name="plus" size={16} />Create product</Link>
        </div>
      </div>

      {view === "list" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-fixed border-collapse text-left">
            <colgroup>{[29.53, 15.85, 15.85, 15.85, 15.85, 7.07].map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup>
            <thead className="h-10 rounded-sm bg-[#F7F7F7] text-[#808080]">
              <tr><th className="px-3 font-medium">Name</th><th className="px-3 font-medium">Category</th><th className="px-3 font-medium">Price</th><th aria-sort={sort?.key === "stock" ? sort.direction === "asc" ? "ascending" : "descending" : "none"} className="px-3 font-medium"><button className="flex items-center gap-3" onClick={() => toggleSort("stock")}>Stock quantity {sortIcon("stock")}</button></th><th aria-sort={sort?.key === "status" ? sort.direction === "asc" ? "ascending" : "descending" : "none"} className="px-3 font-medium"><button className="flex items-center gap-2" onClick={() => toggleSort("status")}>Status {sortIcon("status")}</button></th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody className="text-[#5B5B5B]">
              <tr aria-hidden="true" className="h-4"><td colSpan={6} /></tr>
              {visible.map((listing) => (
                <tr key={listing.id} className="h-[76px] border-b border-[#F1F1F1] hover:bg-[#FAFAFA]">
                  <td className="px-3 py-3"><Link href={`/listings/${listing.id}`} className="flex items-center gap-3 font-medium leading-5 tracking-[-0.015em] text-[#373737] hover:text-[#F75803]"><MediaPreview media={listing.media[0]} className="h-12 w-12 shrink-0" label={listing.name} /><span>{listing.name}</span></Link></td>
                  <td className="px-3">{listing.category}</td><td className="px-3 font-medium text-[#373737]">{money(listing.price).replace(/\.00$/, "")}</td><td className="px-3">{listing.stock.toLocaleString()}</td><td className="px-3"><StatusBadge status={listing.status} /></td><td className="px-3 text-right">{actions(listing)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((listing) => (
            <article key={listing.id} className="overflow-hidden rounded-lg border border-[#E4E4E4]">
              <div className="relative h-40"><Link href={`/listings/${listing.id}`} className="block h-full"><MediaPreview media={listing.media[0]} className="h-full rounded-none" label={listing.name} /></Link><span className="pointer-events-none absolute left-3 top-3"><StatusBadge status={listing.status} /></span><div className="absolute right-3 top-3">{actions(listing, true)}</div></div>
              <div className="flex h-[92px] flex-col gap-0.5 p-3"><Link href={`/listings/${listing.id}`} className="font-medium leading-5 tracking-[-0.015em] text-[#373737]">{listing.name}</Link><p className="leading-5 text-[#808080]">{money(listing.price).replace(/\.00$/, "")}</p><p className="leading-6 tracking-[-0.018em] text-[#808080]">Stock quality: {listing.stock}</p></div>
            </article>
          ))}
        </div>
      )}
      {!filtered.length && <div className="py-16 text-center text-[#808080]"><p className="font-medium text-[#373737]">No listings found</p><p className="mt-1">Try a different search or filter.</p><button className={cn(salesOutlineButton, "mt-4")} onClick={() => { setQuery(""); setStatusFilter("all"); setCategory("all"); }}>Clear filters</button></div>}
      <div className={cn("mt-auto pt-8", view === "grid" && "hidden")}><SalesPagination page={currentPage} pageSize={pageSize} total={filtered.length} onChange={setPage} /></div>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}>
        <DialogContent closeIcon={<DesignIcon name="close-circle" size={24} />} className="INT400 max-w-[420px] rounded-xl"><DialogHeader><DialogTitle>Delete listing?</DialogTitle><DialogDescription>Delete {pendingDelete?.name} from your listings? This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter><button className={salesOutlineButton} onClick={() => setPendingDelete(null)}>Cancel</button><button className={cn(salesButton, "bg-[#C83532] hover:bg-[#B42C2A]")} onClick={() => { if (pendingDelete) deleteListing(pendingDelete.id); setPendingDelete(null); }}>Delete listing</button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
