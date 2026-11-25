"use client";

import { useState } from "react";
import { ListingVariant } from "@/types/listings";
import { listingColors, listingSizes } from "@/mock/listings";
import { DesignIcon } from "./DesignIcon";
import { ColorPicker } from "./ColorPicker";
import { SalesSelect } from "./SalesSelect";
import { salesInput, salesOutlineButton, salesPanel } from "./SalesPrimitives";
import { cn } from "@/lib/utils";

type Props = {
  colors: string[];
  sizes: string[];
  variants: ListingVariant[];
  basePrice: number;
  onOptionsChange: (colors: string[], sizes: string[]) => void;
  onChange: (variants: ListingVariant[]) => void;
};

function VariantCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={onChange} className="flex h-6 w-6 items-center justify-center rounded outline-none focus-visible:ring-2 focus-visible:ring-[#F75803]">{checked ? <span className="flex h-[19px] w-[19px] items-center justify-center rounded-sm bg-[#F75803]"><DesignIcon name="check" size={16} /></span> : <DesignIcon name="checkbox" size={24} />}</button>;
}

export function VariantEditor({ colors, sizes, variants, onOptionsChange, onChange }: Props) {
  const [palette, setPalette] = useState(listingColors);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: "price" | "stock"; ascending: boolean } | null>(null);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const selectedIds = selected.filter((id) => variants.some((item) => item.id === id));
  const rows = sort ? [...variants].sort((a, b) => (a[sort.key] - b[sort.key]) * (sort.ascending ? 1 : -1)) : variants;
  const update = (id: string, patch: Partial<ListingVariant>) => onChange(variants.map((item) => item.id === id ? { ...item, ...patch } : item));
  const colorOptions = Array.from(new Set([...palette.map((item) => item.value), ...colors, ...variants.map((item) => item.color)])).map((value) => ({ value, label: palette.find((item) => item.value === value)?.name || value, color: value }));
  const sortBy = (key: "price" | "stock") => setSort((current) => ({ key, ascending: current?.key !== key || !current.ascending }));

  return (
    <section className={salesPanel} aria-labelledby="variants-heading">
      <h2 id="variants-heading" className="mb-5 font-medium text-black">Variants</h2>
      <fieldset><legend className="mb-2 text-[12px] leading-4 text-black">Colors</legend>
        <div className="flex flex-wrap items-center gap-3">
          {palette.map((color) => <button key={color.value} type="button" aria-label={color.name} aria-pressed={colors.includes(color.value)} onClick={() => onOptionsChange(colors.includes(color.value) ? colors.filter((value) => value !== color.value) : [...colors, color.value], sizes)} className="flex h-6 w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#808080] focus-visible:ring-offset-2" style={{ backgroundColor: color.value }}>{colors.includes(color.value) && <DesignIcon name="check" size={16} />}</button>)}
          <ColorPicker selected={colors} onAdd={(value) => { if (!palette.some((item) => item.value === value)) setPalette((current) => [...current, { name: value, value }]); if (!colors.includes(value)) onOptionsChange([...colors, value], sizes); }} />
        </div>
      </fieldset>
      <fieldset className="mt-5"><legend className="mb-2 text-[12px] leading-4 text-black">Sizes</legend>
        <div className="flex flex-wrap gap-1.5">{listingSizes.map((size) => <button key={size} type="button" aria-pressed={sizes.includes(size)} onClick={() => onOptionsChange(colors, sizes.includes(size) ? sizes.filter((value) => value !== size) : [...sizes, size])} className={cn("h-7 w-16 rounded-md border text-[12px] leading-4", sizes.includes(size) ? "border-[#F75803] bg-[#FFEEE6] text-[#525866]" : "border-[#E2E4E9] bg-white text-[#525866]")}>{size}</button>)}</div>
      </fieldset>
      {variants.length > 0 && <>
        {selectedIds.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2 rounded bg-[#F7F7F7] p-2">
          <span className="text-[12px] text-[#808080]">{selectedIds.length} selected</span>
          <input aria-label="Bulk price" placeholder="Price" type="number" min={0} value={bulkPrice} onChange={(event) => setBulkPrice(event.target.value)} className={cn(salesInput, "h-8 w-24 rounded-lg")} />
          <input aria-label="Bulk stock" placeholder="Stock" type="number" min={0} step={1} value={bulkStock} onChange={(event) => setBulkStock(event.target.value)} className={cn(salesInput, "h-8 w-24 rounded-lg")} />
          <button type="button" className={salesOutlineButton} onClick={() => onChange(variants.map((item) => selectedIds.includes(item.id) ? { ...item, ...(bulkPrice !== "" ? { price: Math.max(0, Number(bulkPrice) || 0) } : {}), ...(bulkStock !== "" ? { stock: Math.max(item.reserved, Math.floor(Number(bulkStock) || 0)) } : {}) } : item))}>Apply</button>
          <button type="button" aria-label="Delete selected variants" className="p-1" onClick={() => { onChange(variants.filter((item) => !selectedIds.includes(item.id))); setSelected([]); }}><DesignIcon name="trash" size={20} /></button>
        </div>}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] table-fixed border-collapse text-left">
            <colgroup><col className="w-12" />{[0, 1, 2, 3].map((index) => <col key={index} />)}<col className="w-12" /></colgroup>
            <thead className="h-10 bg-[#F7F7F7] text-[#808080]"><tr>
              <th className="px-3"><VariantCheckbox checked={selectedIds.length === variants.length} onChange={() => setSelected(selectedIds.length === variants.length ? [] : variants.map((item) => item.id))} label="Select all variants" /></th>
              <th className="px-3 font-medium">Size</th><th className="px-3 font-medium">Color</th>
              {(["price", "stock"] as const).map((key) => <th key={key} className="px-3 font-medium" aria-sort={sort?.key === key ? sort.ascending ? "ascending" : "descending" : "none"}><button type="button" className="flex items-center gap-2" onClick={() => sortBy(key)}>{key === "price" ? "Price" : "Stock"}<DesignIcon name="sort" size={16} /></button></th>)}<th><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>{rows.map((variant) => <tr key={variant.id} className="h-[60px]">
              <td className="border-b border-[#F1F1F1] px-3"><VariantCheckbox checked={selectedIds.includes(variant.id)} label={`Select ${variant.size} ${variant.color}`} onChange={() => setSelected((current) => current.includes(variant.id) ? current.filter((id) => id !== variant.id) : [...current, variant.id])} /></td>
              <td className="border-b border-[#F1F1F1] px-3"><SalesSelect label={`Size for variant ${variant.id}`} value={variant.size} onChange={(value) => update(variant.id, { size: value })} options={listingSizes.map((value) => ({ value, label: value }))} compact className="h-9 w-[88px] rounded-lg border-[#E2E4E9] text-[#111810] shadow-[0_1px_2px_#00000005]" /></td>
              <td className="border-b border-[#F1F1F1] px-3"><SalesSelect label={`Color for variant ${variant.id}`} value={variant.color} onChange={(value) => update(variant.id, { color: value })} options={colorOptions} colorOnly compact className="w-14 border-transparent px-0" /></td>
              <td className="border-b border-[#F1F1F1] px-3"><input aria-label={`Price for ${variant.size} ${variant.color}`} type="text" inputMode="decimal" value={priceDrafts[variant.id] ?? variant.price.toLocaleString("en-US", { maximumFractionDigits: 2 })} onFocus={() => setPriceDrafts((current) => ({ ...current, [variant.id]: String(variant.price) }))} onBlur={() => setPriceDrafts((current) => { const next = { ...current }; delete next[variant.id]; return next; })} onChange={(event) => { const value = event.target.value.replace(/,/g, ""); if (/^[0-9]*([.][0-9]{0,2})?$/.test(value)) { setPriceDrafts((current) => ({ ...current, [variant.id]: value })); update(variant.id, { price: Number(value) || 0 }); } }} className={cn(salesInput, "h-9 rounded-lg px-2 text-[#868C98]")} /></td>
              <td className="border-b border-[#F1F1F1] px-3"><input aria-label={`Stock for ${variant.size} ${variant.color}`} type="number" min={variant.reserved} step={1} value={variant.stock} onChange={(event) => update(variant.id, { stock: Math.max(0, Math.floor(Number(event.target.value) || 0)) })} className={cn(salesInput, "h-9 rounded-lg px-2 text-[#868C98]")} /></td>
              <td className="border-b border-[#F1F1F1] px-3"><button type="button" aria-label={`Delete ${variant.size} ${variant.color} variant`} onClick={() => onChange(variants.filter((item) => item.id !== variant.id))} className="flex h-6 w-6 items-center justify-center"><DesignIcon name="trash" size={20} /></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="mt-3 flex min-h-9 items-center gap-2 rounded-sm bg-[#FFEEE6] p-2 text-[12px] leading-4 text-[#F75803]"><DesignIcon name="info-orange" size={20} className="shrink-0" />You can edit the price and stock for each variant, or use bulk actions to apply the same values.</p>
      </>}
    </section>
  );
}
