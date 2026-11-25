"use client";

import { useMemo, useState } from "react";
import { Listing } from "@/types/listings";
import { DesignIcon } from "./DesignIcon";
import { InventoryTooltip } from "./InventoryTooltip";
import { StatusBadge } from "./SalesPrimitives";

type SortKey = "stock" | "available" | "reserved";

export function ListingInventory({ listing }: { listing: Listing }) {
  const [sort, setSort] = useState<{ key: SortKey; ascending: boolean } | null>(null);
  const rows = useMemo(() => {
    const byColor = new Map<string, { color: string; stock: number; reserved: number; available: number }>();
    for (const variant of listing.variants) {
      const row = byColor.get(variant.color) || { color: variant.color, stock: 0, reserved: 0, available: 0 };
      row.stock += variant.stock;
      row.reserved += variant.reserved;
      row.available += Math.max(0, variant.stock - variant.reserved);
      byColor.set(variant.color, row);
    }
    const values = Array.from(byColor.values());
    return sort ? values.sort((a, b) => (a[sort.key] - b[sort.key]) * (sort.ascending ? 1 : -1)) : values;
  }, [listing.variants, sort]);
  const available = rows.reduce((total, row) => total + row.available, 0);
  const reserved = rows.reduce((total, row) => total + row.reserved, 0);

  return <>
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Colors / variants", rows.length], ["Available units", available], ["Reserved units", reserved], ["Total on hand", listing.stock]].map(([label, value]) => <div key={label} className="h-24 rounded border border-[#E4E4E4] bg-[#F7F7F7] px-[7px] py-[15px]">
        <p className="flex items-center gap-1.5 font-normal leading-6 text-[#5B5B5B]">{label}<DesignIcon name="package" size={16} /></p>
        <p className="mt-2 text-[28px] font-medium leading-8 tracking-[-0.02em] text-[#111810]">{Number(value).toLocaleString()}</p>
      </div>)}
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[720px] table-fixed border-collapse text-left">
      <colgroup>{Array.from({ length: 5 }, (_, index) => <col key={index} className="w-1/5" />)}</colgroup>
      <thead className="h-10 rounded-sm bg-[#F7F7F7] text-[#808080]"><tr><th className="px-3 font-medium">Color</th>
        {(["stock", "available", "reserved"] as const).map((key) => <th key={key} className="px-3 font-medium" aria-sort={sort?.key === key ? sort.ascending ? "ascending" : "descending" : "none"}>
          <div className="flex items-center gap-1"><InventoryTooltip field={key} /><button type="button" onClick={() => setSort(current => ({ key, ascending: current?.key !== key || !current.ascending }))} className="flex items-center gap-1 leading-5">{key === "stock" ? "On hand" : key === "available" ? "Available" : "Reserved"}<DesignIcon name="sort" size={16} /></button></div>
        </th>)}<th className="px-3 font-medium">Status</th></tr></thead>
      <tbody><tr aria-hidden="true" className="h-4"><td colSpan={5} /></tr>{rows.map(row => <tr key={row.color} className="h-[76px]">
        <td className="border-b border-[#F1F1F1] px-3"><span aria-label={`Color ${row.color}`} className="block h-8 w-8 rounded-full" style={{ backgroundColor: row.color }} /></td>
        <td className="border-b border-[#F1F1F1] px-3 font-medium text-[#111810]">{row.stock}</td><td className="border-b border-[#F1F1F1] px-3 text-[#5B5B5B]">{row.available}</td><td className="border-b border-[#F1F1F1] px-3 text-[#5B5B5B]">{row.reserved}</td>
        <td className="border-b border-[#F1F1F1] px-3"><StatusBadge status={row.available <= 0 ? "OUT OF STOCK" : row.available < 10 ? "LOW STOCK" : "ACTIVE"} /></td>
      </tr>)}</tbody>
    </table>{!rows.length && <p className="py-12 text-center text-[#808080]">No variants added. Edit this listing to add inventory.</p>}</div>
  </>;
}
