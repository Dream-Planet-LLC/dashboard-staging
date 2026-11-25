"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DesignIcon } from "./DesignIcon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesSelect } from "./SalesSelect";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useListings } from "./ListingsProvider";
import { sampleListingOrders } from "@/mock/listings";
import { Listing, ListingOrder, ListingOrderStatus } from "@/types/listings";
import { MediaPreview, money, salesButton, salesOutlineButton, salesPanel, SalesBackLink, SalesSearch, StatusBadge } from "./SalesPrimitives";
import { ListingInventory } from "./ListingInventory";
import { ListingOrderSummary } from "./ListingOrderSummary";
import { SalesTimeline } from "./SalesTimeline";
import { cn } from "@/lib/utils";

const detailTabs = ["Overview", "Inventory", "Orders", "Activity", "Creator listing"];
const detailTabClass = "h-[41px] rounded-none border-b border-transparent px-0 pb-4 pt-0 text-[16px] font-medium leading-6 tracking-[-0.015em] text-[#A4A4A4] data-[state=active]:border-[#F75803] data-[state=active]:bg-transparent data-[state=active]:text-[#111810] data-[state=active]:shadow-none";
const dateLabel = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const statusOptions = ["PROCESSING", "PENDING", "CANCELLED", "SHIPPED", "DELIVERED"].map(value => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }));

export default function ListingDetail({ listing }: { listing: Listing }) {
  const { deleteListing } = useListings();
  const router = useRouter();
  const isSample = /^listing-[1-6]$/.test(listing.id);
  const [orders, setOrders] = useState<ListingOrder[]>(isSample ? sampleListingOrders : []);
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [orderDate, setOrderDate] = useState("all");
  const [order, setOrder] = useState<ListingOrder | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [amountSort, setAmountSort] = useState<"asc" | "desc" | null>(null);
  const [statusSort, setStatusSort] = useState<"asc" | "desc" | null>(null);
  const available = listing.variants.reduce((total, item) => total + Math.max(0, item.stock - item.reserved), 0);
  const filteredOrders = useMemo(() => {
    const result = orders.filter(item => (item.id + " " + item.customer).toLowerCase().includes(orderQuery.toLowerCase())
      && (orderStatus === "all" || item.status === orderStatus)
      && (orderDate === "all" || Date.now() - new Date(item.date).getTime() <= Number(orderDate) * 86400000));
    if (amountSort) result.sort((a, b) => (a.amount - b.amount) * (amountSort === "asc" ? 1 : -1));
    if (statusSort) result.sort((a, b) => a.status.localeCompare(b.status) * (statusSort === "asc" ? 1 : -1));
    return result;
  }, [orders, orderQuery, orderStatus, orderDate, amountSort, statusSort]);

  const updateOrderStatus = (status: ListingOrderStatus) => {
    if (!order) return;
    const updated = { ...order, status };
    setOrder(updated);
    setOrders(current => current.map(item => item.id === order.id ? updated : item));
  };

  return (
    <div className="INT400 pb-10 text-[14px] leading-6 text-[#111810]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><SalesBackLink /><h1 className="text-[24px] font-medium leading-8 tracking-[-0.015em]">{listing.name}</h1><div className="mt-0.5 flex items-center gap-3 text-[#808080]"><span>{listing.category}</span><span className="h-4 border-l border-[#C8C8C8]" /><StatusBadge status={listing.status} className="rounded-full" /></div></div>
        <div className="flex gap-4"><button className={cn(salesOutlineButton, "text-[#C83532]")} onClick={() => setDeleteOpen(true)}><DesignIcon name="trash-simple-red" size={20} />Delete</button><Link href={"/listings/" + listing.id + "/edit"} className={salesButton}><DesignIcon name="plus" size={16} />Edit product</Link></div>
      </header>

      <div aria-label="Product statistics" className="my-8 grid grid-cols-2 gap-y-5 sm:grid-cols-3 lg:flex lg:justify-between">
        {[
          { label: "Units sold", value: isSample ? "232K" : "0", icon: "cart" },
          { label: "Total revenue", value: isSample ? "5.2K" : "$0", icon: "money" },
          { label: "Total orders", value: isSample ? "5.2K" : "0", icon: "package" },
          { label: "Available stock", value: available.toLocaleString(), icon: "package" },
          { label: "Creators listing", value: isSample ? "23" : "0", icon: "package" },
        ].map((metric, index) => <div key={metric.label} className={cn("relative min-h-[60px] lg:w-[184px]", index > 0 && "pl-3")} >{index > 0 && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-[#E4E4E4]" />}<p className={cn("flex items-center gap-1.5 leading-6", index > 2 ? "text-[#373737]" : "text-[#5B5B5B]")}>{metric.label}<DesignIcon name={metric.icon} size={16} /></p><p className="mt-1 text-[28px] font-medium leading-8 tracking-[-0.02em]">{metric.value}</p></div>)}
      </div>

      <Tabs defaultValue="Overview">
        <div className="overflow-x-auto"><TabsList className="mb-[23px] flex h-[41px] w-full min-w-[540px] justify-start gap-10 rounded-none border-b border-[#F1F1F1] bg-transparent p-0">{detailTabs.map(tab => <TabsTrigger key={tab} value={tab} className={detailTabClass}>{tab}</TabsTrigger>)}</TabsList></div>
        <TabsContent value="Overview" className="mt-0">
          <div className="grid items-start gap-6 lg:max-w-[983px] lg:grid-cols-[420fr_539fr]">
            <div><MediaPreview media={listing.media[activeImage]} label={listing.name} className="h-[378px] w-full rounded-lg" /><div className="mt-3 grid grid-cols-4 gap-3">{listing.media.slice(0, 4).map((media, index) => <button key={index} type="button" aria-label={"Product image " + (index + 1)} onClick={() => setActiveImage(index === 3 && listing.media.length > 4 ? activeImage >= 3 ? (activeImage + 1) % listing.media.length || 3 : 3 : index)} className={cn("relative overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-[#F75803]", index === Math.min(activeImage, 3) && "ring-2 ring-[#F75803]")}><MediaPreview media={index === 3 && activeImage > 3 ? listing.media[activeImage] : media} label={"Product image " + (index + 1)} className="aspect-square w-full rounded-lg" />{index === 3 && listing.media.length > 4 && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">+{listing.media.length - 3}</span>}</button>)}</div></div>
            <section aria-label="Basic information" className={cn(salesPanel, "px-4 py-6 lg:min-h-[438px]")}><h2 className="mb-3 font-medium leading-5 tracking-[-0.015em] text-black">Basic information</h2><dl className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-x-3 gap-y-3">
              {[["Product name", listing.name], ["Price", money(listing.price)], ["Category", listing.category], ["Created on", dateLabel(listing.createdAt)], ["Created by", listing.createdBy], ["Variants", String(listing.variants.length)], ["Description", listing.description || "No description added."]].map(([label, value]) => <div key={label} className="contents"><dt className={cn("leading-6 text-[#808080]", label === "Description" && "self-start")}>{label}</dt><dd className={cn("break-words font-medium leading-5 tracking-[-0.015em]", label === "Description" && "self-start")}>{value}</dd></div>)}
            </dl></section>
          </div>
        </TabsContent>
        <TabsContent value="Inventory" className="mt-0"><ListingInventory listing={listing} /></TabsContent>
        <TabsContent value="Orders" className="mt-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="sm:[&>div]:w-[272px]"><SalesSearch value={orderQuery} onChange={setOrderQuery} /></div>
            <div className="flex gap-3"><SalesSelect value={orderDate} onChange={setOrderDate} label="Order date filter" iconName="calendar" className="w-[101px] border-[#E4E4E4]" options={[{ value: "all", label: "All Dates" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }]} /><SalesSelect value={orderStatus} onChange={setOrderStatus} label="Order status filter" className="w-[104px] border-[#E4E4E4]" options={[{ value: "all", label: "All Status" }, ...statusOptions]} /></div>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[1000px] table-fixed border-collapse text-left"><colgroup>{Array.from({ length: 8 }, (_, index) => <col key={index} className="w-[12.5%]" />)}</colgroup><thead className="h-10 rounded-sm bg-[#F7F7F7] text-[#808080]"><tr>{["Order ID", "Customer", "Color", "Size", "Quantity"].map(label => <th key={label} className="px-3 font-medium">{label}</th>)}<th className="px-[7px] font-medium" aria-sort={amountSort === "asc" ? "ascending" : amountSort === "desc" ? "descending" : "none"}><button className="flex items-center gap-1 whitespace-nowrap" onClick={() => { setAmountSort(value => value === "asc" ? "desc" : "asc"); setStatusSort(null); }}>Product amount<DesignIcon name="sort" size={16} /></button></th><th className="px-3 font-medium" aria-sort={statusSort === "asc" ? "ascending" : statusSort === "desc" ? "descending" : "none"}><button className="flex items-center gap-1" onClick={() => { setStatusSort(value => value === "asc" ? "desc" : "asc"); setAmountSort(null); }}>Status<DesignIcon name="sort" size={16} /></button></th><th className="px-3 font-medium">Date</th></tr></thead>
            <tbody><tr aria-hidden="true" className="h-4"><td colSpan={8} /></tr>{filteredOrders.map(item => <tr key={item.id} className="h-[76px] border-b border-[#F1F1F1] text-[#5B5B5B]"><td className="px-3"><button className="font-medium text-[#373737] hover:text-[#F75803]" onClick={() => setOrder(item)}>#{item.id}</button></td><td className="px-3">{item.customer}</td><td className="px-3">{item.summary?.items[0]?.name.includes("Hoodie") ? "Hoodie" : listing.category}</td><td className="px-3">{item.size}</td><td className="px-3">{item.quantity}</td><td className="px-3 font-medium">{money(item.amount).replace(/\.00$/, "")}</td><td className="px-3"><StatusBadge status={item.status} /></td><td className="whitespace-nowrap px-3">{dateLabel(item.date)}</td></tr>)}</tbody>
          </table>{!filteredOrders.length && <p className="py-12 text-center text-[#808080]">No orders found.</p>}</div>
        </TabsContent>
        <TabsContent value="Activity" className="mt-0"><section className={cn(salesPanel, "p-6")} aria-label="Product activity"><SalesTimeline items={listing.activity} /></section></TabsContent>
        <TabsContent value="Creator listing" className="mt-0"><div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left"><thead className="h-10 bg-[#F7F7F7] text-[#808080]"><tr>{["Creator", "Product", "Amount", "Status"].map(label => <th key={label} className="px-3 font-medium">{label}</th>)}</tr></thead><tbody>{isSample ? <tr className="h-[76px] border-b border-[#F1F1F1]"><td className="px-3"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F7F7] text-[#808080]">JM</span>Jordan Miller</div></td><td className="px-3">{listing.name}</td><td className="px-3">{money(listing.price)}</td><td className="px-3"><StatusBadge status={listing.status} /></td></tr> : <tr><td colSpan={4} className="py-12 text-center text-[#808080]">No creators have listed this product yet.</td></tr>}</tbody></table></div></TabsContent>
      </Tabs>

      <ListingOrderSummary order={order} listing={listing} onClose={() => setOrder(null)} onStatusChange={updateOrderStatus} />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}><DialogContent closeIcon={<DesignIcon name="close-circle" size={24} />} className="INT400 max-w-[420px] rounded-xl"><DialogHeader><DialogTitle>Delete listing?</DialogTitle><DialogDescription>Delete {listing.name} from your listings? This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter><button className={salesOutlineButton} onClick={() => setDeleteOpen(false)}>Cancel</button><button className={cn(salesButton, "bg-[#C83532] hover:bg-[#B42C2A]")} onClick={() => { deleteListing(listing.id); router.push("/listings"); }}>Delete listing</button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
