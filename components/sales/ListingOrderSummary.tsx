"use client";

import { useState } from "react";
import * as Select from "@radix-ui/react-select";
import { Listing, ListingOrder, ListingOrderStatus } from "@/types/listings";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DesignIcon } from "./DesignIcon";
import { MediaPreview, money } from "./SalesPrimitives";
import { SalesTimeline } from "./SalesTimeline";

const statusValues: ListingOrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const label = (status: string) => status.charAt(0) + status.slice(1).toLowerCase();
const wholeMoney = (amount: number) => money(amount).replace(/\.00$/, "");
const tabClass = "h-7 flex-1 rounded-[10px] px-2 py-1 text-[14px] font-medium leading-5 tracking-[-0.015em] text-[#868C98] data-[state=active]:bg-white data-[state=active]:text-[#0A0D14] data-[state=active]:shadow-[0_2px_4px_#122B690A,0_4px_8px_#122B6914]";

export function ListingOrderSummary({ order, listing, onClose, onStatusChange }: { order: ListingOrder | null; listing: Listing; onClose: () => void; onStatusChange: (value: ListingOrderStatus) => void }) {
  const [tab, setTab] = useState("Details");
  const summary = order?.summary;
  const items = summary?.items || (order ? [{ name: listing.name, color: "Black", quantity: order.quantity, amount: order.amount, media: listing.media[0] }] : []);
  const completedThrough = order?.status === "DELIVERED" ? 4 : order?.status === "SHIPPED" ? 3 : order?.status === "PROCESSING" ? 2 : 1;

  return <Sheet open={!!order} onOpenChange={open => { if (!open) { onClose(); setTab("Details"); } }}>
    <SheetContent overlayClassName="bg-black/25" closeIcon={<DesignIcon name="close" size={20} />} closeButtonClassName="right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-[#F1F1F1] bg-white" className="INT400 flex w-full flex-col gap-0 overflow-hidden border-0 bg-white p-0 text-[14px] leading-6 text-[#111810] sm:max-w-[430px]">
      <SheetHeader className="h-20 shrink-0 justify-center space-y-0 p-6 text-left"><SheetTitle className="text-[20px] font-medium leading-7 tracking-[-0.015em] text-[#111810]">Order summary</SheetTitle><SheetDescription className="sr-only">Items, recipient details, and delivery timeline for order {order?.id}.</SheetDescription></SheetHeader>
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-6 pb-6"><p className="text-[18px] font-medium leading-6 tracking-[-0.015em]">#{order?.id}</p><p className="mt-1 text-[#808080]">Placed {order && new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}, {order && new Date(order.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(" ", "")}</p><TabsList className="mt-4 flex h-9 w-full gap-1 rounded-xl bg-[#F1F1F1] p-1"><TabsTrigger className={tabClass} value="Details">Details</TabsTrigger><TabsTrigger className={tabClass} value="Timeline">Timeline</TabsTrigger></TabsList></div>
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#F1F1F1]">
          <TabsContent value="Details" className="m-0">
            <section className="p-6"><h3 className="font-medium leading-5 tracking-[-0.015em] text-[#808080]">Item Summary</h3><div className="mt-3 space-y-5">{items.map((item, index) => <div key={`${item.color}-${index}`} className="flex h-12 items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><MediaPreview media={item.media} label={item.name} className="h-12 w-12 shrink-0 rounded-sm" /><div className="min-w-0"><p className="truncate font-medium leading-5 tracking-[-0.015em]">{item.name}</p><p className="flex items-center gap-1.5 text-[#A4A4A4]"><span>{item.color}</span><span className="h-[3px] w-[3px] rounded-full bg-[#C8C8C8]" />Qty {item.quantity}</p></div></div><span className="shrink-0">{wholeMoney(item.amount)}</span></div>)}</div><dl className="mt-6 space-y-2"><div className="flex justify-between"><dt className="text-[#A4A4A4]">Shipping</dt><dd className="font-medium">{wholeMoney(summary?.shipping || 0)}</dd></div><div className="flex justify-between"><dt className="text-[#A4A4A4]">Delivery fee</dt><dd className="font-medium">{wholeMoney(summary?.deliveryFee || 0)}</dd></div><div className="flex justify-between text-[16px] font-medium"><dt>Total items ({items.length})</dt><dd>{(summary?.total ?? order?.amount ?? 0).toLocaleString("en-US")}</dd></div></dl></section>
            <section className="border-t border-[#F1F1F1] p-6"><h3 className="font-medium leading-5 tracking-[-0.015em] text-[#808080]">Shipping Address</h3><p className="mt-3 font-medium leading-5">{summary?.recipient || order?.customer}</p><p className="mt-1 text-[#808080]">{summary?.address || "No shipping address provided."}</p></section>
            <section className="border-t border-[#F1F1F1] p-6"><h3 className="font-medium leading-5 tracking-[-0.015em] text-[#808080]">Recipient contact</h3><div className="mt-3 space-y-2"><p className="flex items-center gap-2"><DesignIcon name="phone" size={20} />{summary?.phone || "No phone provided"}</p><p className="flex items-center gap-2"><DesignIcon name="envelope" size={20} />{summary?.email || "No email provided"}</p></div></section>
            <section className="border-t border-[#F1F1F1] p-6"><h3 className="font-medium leading-5 tracking-[-0.015em] text-[#808080]">Listed by</h3><div className="mt-3 flex h-[42px] items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFEEE6] text-[16px] font-medium text-[#7E2D02]">NA</span><div><p className="font-medium leading-5 tracking-[-0.015em]">{order?.creator}</p><p className="text-[#A4A4A4]">Creator</p></div></div></section>
          </TabsContent>
          <TabsContent value="Timeline" className="m-0 p-6"><SalesTimeline items={["Order placed", "Payment confirmed", "Processing", "Shipped", "Delivered"].map((title, index) => ({ title, date: order?.date, waiting: index > completedThrough }))} /></TabsContent>
        </div>
      </Tabs>
      {order && <footer className="shrink-0 border-t border-[#E4E4E4] p-6">
        <Select.Root value={order.status} onValueChange={value => onStatusChange(value as ListingOrderStatus)}><Select.Trigger aria-label="Update order status" className="flex h-10 w-full items-center overflow-hidden rounded-xl bg-[#F75803] text-white shadow-[0_0_0_1px_#122B6914,0_1px_2px_#122B6914,0_2px_6px_#122B690A] outline-none focus-visible:ring-2 focus-visible:ring-[#F75803] focus-visible:ring-offset-2"><span className="flex flex-1 justify-center px-3 font-medium leading-5"><Select.Value /></span><Select.Icon className="flex h-full w-[52px] shrink-0 items-center justify-center border-l border-[#F1F1F1]"><DesignIcon name="caret-right-solid" size={20} /></Select.Icon></Select.Trigger><Select.Portal><Select.Content position="popper" side="top" sideOffset={8} align="start" className="INT400 z-[60] w-[var(--radix-select-trigger-width)] rounded-xl border border-[#E2E4E9] bg-white p-2 shadow-[0_12px_24px_#868C981F]"><Select.Viewport>{statusValues.map(status => <Select.Item key={status} value={status} className="flex h-9 cursor-pointer items-center justify-between gap-3 rounded-lg px-2 text-[14px] leading-5 text-[#0A0D14] outline-none data-[highlighted]:bg-[#F6F8FA] data-[state=checked]:bg-[#F6F8FA]"><Select.ItemText>{label(status)}</Select.ItemText><span className="h-5 w-5"><Select.ItemIndicator><DesignIcon name="check" size={20} color="#F75803" /></Select.ItemIndicator></span></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal></Select.Root>
      </footer>}
    </SheetContent>
  </Sheet>;
}
