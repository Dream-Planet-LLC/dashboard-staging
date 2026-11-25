"use client";

import { FormEvent, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Category, CategoryDraft } from "@/types/categories";
import { ListingMedia } from "@/types/listings";
import { useCategories } from "./CategoriesProvider";
import { useListings } from "./ListingsProvider";
import { CategoryIcon, CategoryMedia, categoryOutline, categoryPrimary } from "./CategoryPrimitives";
import { money } from "./SalesPrimitives";
import { cn } from "@/lib/utils";

export function CategoryEditor({ category, pickerOnly = false, onClose, onSave }: { category?: Category; pickerOnly?: boolean; onClose: () => void; onSave: (draft: CategoryDraft) => void }) {
  const { products, categories } = useCategories();
  const { listings } = useListings();
  const [name, setName] = useState(category?.name || "");
  const [picture, setPicture] = useState<ListingMedia | undefined>(category?.picture);
  const [selectedIds, setSelectedIds] = useState<string[]>(category?.productIds || []);
  const [pendingIds, setPendingIds] = useState(selectedIds);
  const [step, setStep] = useState<"form" | "picker">(pickerOnly ? "picker" : "form");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const selectedProducts = selectedIds.map(id => products.find(product => product.id === id)).filter((product): product is typeof products[number] => !!product);
  const pickerProducts = [...listings, ...products.filter(product => pendingIds.includes(product.id) && !listings.some(item => item.id === product.id))].filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
  const title = category ? "Edit category" : "New category";

  const upload = async (files: FileList | File[]) => {
    setError("");
    if (files.length !== 1) { setError("Choose one category picture."); return; }
    const file = files[0];
    if (!["image/jpeg", "image/png"].includes(file.type)) { setError("Choose a JPEG or PNG picture."); return; }
    if (file.size > 50 * 1024 * 1024) { setError("Choose a picture smaller than 50 MB."); return; }
    setUploading(true);
    try {
      const url = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Unable to read picture")); reader.readAsDataURL(file); });
      setPicture({ url, name: file.name, type: file.type });
    } catch { setError("The picture could not be uploaded. Please try again."); }
    finally { setUploading(false); if (fileInput.current) fileInput.current.value = ""; }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setError("Enter a category name."); return; }
    if (categories.some(item => item.id !== category?.id && item.name.toLowerCase() === name.trim().toLowerCase())) { setError("A category with this name already exists."); return; }
    onSave({ name, picture, productIds: selectedIds });
  };
  const openPicker = () => { setPendingIds(selectedIds); setQuery(""); setStep("picker"); };
  const donePicker = () => { if (pickerOnly) onSave({ name, picture, productIds: pendingIds }); else { setSelectedIds(pendingIds); setStep("form"); } };
  const cancelPicker = () => pickerOnly ? onClose() : setStep("form");

  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/25" /><Dialog.Content className="INT400 fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-[550px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white text-[14px] leading-5 text-[#111810] shadow-[0_16px_40px_-8px_#585C5F29] outline-none">
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E2E4E9] pl-5 pr-4"><Dialog.Title className="text-[16px] font-medium leading-6 tracking-[-0.011em] text-[#0A0D14]">{title}</Dialog.Title><Dialog.Close aria-label="Close" className="h-6 w-6 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#F75803]"><CategoryIcon name="close-circle" size={24} /></Dialog.Close><Dialog.Description className="sr-only">{step === "picker" ? "Select listings to add to this category." : "Set the category name, picture, and listings."}</Dialog.Description></header>
    {step === "form" ? <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 overflow-y-auto p-5"><div className="space-y-5">
        <div><label htmlFor="category-name" className="mb-1 flex h-5 items-center gap-px font-medium tracking-[-0.006em] text-[#0A0D14]">{picture ? "Collection name" : "Category name"}<span aria-hidden="true" className="text-[#375DFB]">*</span></label><input id="category-name" autoComplete="off" value={name} maxLength={100} onChange={event => { setName(event.target.value); setError(""); }} placeholder="e.g, Hoodiee,Snapback" className="h-10 w-full rounded-[10px] border border-[#E2E4E9] bg-white px-3 tracking-[-0.006em] text-[#868C98] shadow-[0_1px_2px_#00000005] outline-none placeholder:text-[#868C98] focus-visible:border-[#F75803]" /></div>
        <div><p className="mb-1 font-medium tracking-[-0.015em] text-black">{picture ? "Collection picture" : "Category picture"}</p><input ref={fileInput} type="file" accept="image/jpeg,image/png" aria-label="Upload category picture" className="hidden" onChange={event => { if (event.target.files) void upload(event.target.files); }} />
          {picture ? <div className="overflow-hidden rounded-lg border border-[#E4E4E4]"><CategoryMedia media={picture} label={picture.name} className="h-[180px] w-full rounded-none" /><div className="flex h-[52px] items-center justify-between px-3"><button type="button" disabled={uploading} onClick={() => fileInput.current?.click()} className="flex items-center gap-2 font-medium tracking-[-0.015em] text-[#5B5B5B]"><CategoryIcon name="image" size={20} />Replace image</button><button type="button" onClick={() => setPicture(undefined)} className="flex items-center gap-2 font-medium tracking-[-0.015em] text-[#C83532]"><CategoryIcon name="x-red" size={20} />Remove</button></div></div>
          : <div onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); if (!uploading) void upload(event.dataTransfer.files); }} className={cn("flex h-48 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#E4E4E4] bg-white p-[31px] text-center", dragging && "border-[#F75803] bg-[#FFEEE6]")}><CategoryIcon name="upload" size={24} /><div><p className="font-medium tracking-[-0.015em]">Choose a file or drag &amp; drop it here.</p><p className="mt-1 text-[12px] font-normal leading-4 text-[#808080]">JPEG or PNG formats, up to 50 MB.</p></div><button type="button" disabled={uploading} onClick={() => fileInput.current?.click()} className={cn(categoryOutline, "w-[114px]")}>{uploading ? "Uploading..." : "Browse files"}</button></div>}
        </div>
        <div><div className="flex h-5 items-center justify-between"><h2 className="font-medium tracking-[-0.015em]">{picture ? "Products" : "Listings"} ({selectedProducts.length})</h2><button type="button" onClick={openPicker} className="flex items-center gap-2 font-medium tracking-[-0.015em] text-[#F75803]"><CategoryIcon name="plus-circle" size={20} />{picture ? "Add products" : "Add listings"}</button></div>
          {selectedProducts.length ? <div className="mt-2 space-y-2">{selectedProducts.map((product, index) => <div key={product.id} className={cn("flex items-center justify-between px-3 py-3", index === selectedProducts.length - 1 ? "h-16" : "h-[65px] border-b border-[#F1F1F1]")}><div className="flex min-w-0 items-center gap-3"><CategoryMedia media={product.media[0]} label={product.name} className="h-10 w-10 shrink-0" /><div className="min-w-0"><p className="truncate font-medium tracking-[-0.015em] text-[#373737]">{product.name}</p><p className="mt-0.5 text-[12px] leading-4 text-[#808080]">{money(product.price).replace(/\.00$/, "")}</p></div></div><button type="button" aria-label={"Remove " + product.name + " from category"} onClick={() => setSelectedIds(ids => ids.filter(id => id !== product.id))} className="ml-3 h-5 w-5 shrink-0"><CategoryIcon name="x-gray" size={20} /></button></div>)}</div>
          : <div className="mt-2 flex h-16 items-center justify-center gap-2 rounded-lg bg-[#F1F1F1] font-normal leading-6 text-[#808080]"><CategoryIcon name="package" size={20} />No listing added</div>}
        </div>
      </div>{error && <p role="alert" className="mt-4 text-[#C83532]">{error}</p>}</div>
      <footer className="flex h-[72px] shrink-0 items-center gap-3 border-t border-[#E2E4E9] px-5"><button type="button" onClick={onClose} className={cn(categoryOutline, "h-10 flex-1")}>Cancel</button><button type="submit" disabled={uploading} className={cn(categoryPrimary, "h-10 flex-1")}>{category ? "Save changes" : "Create category"}</button></footer>
    </form> : <>
      <div className="min-h-0 overflow-y-auto p-5"><div className="relative mb-3"><CategoryIcon name="search" size={20} color="#808080" className="pointer-events-none absolute left-3 top-3" /><input aria-label="Search listings to add" placeholder="Search listings..." value={query} onChange={event => setQuery(event.target.value)} className="h-11 w-full rounded-[10px] border border-[#E4E4E4] bg-white pl-10 pr-3 text-[14px] leading-6 text-[#111810] outline-none placeholder:text-[#A4A4A4] focus-visible:border-[#F75803]" /></div>
        <div className="space-y-2">{pickerProducts.map(product => <button key={product.id} type="button" role="checkbox" aria-checked={pendingIds.includes(product.id)} aria-label={"Select " + product.name} onClick={() => setPendingIds(ids => ids.includes(product.id) ? ids.filter(id => id !== product.id) : [...ids, product.id])} className={cn("flex h-[66px] w-full items-center justify-between gap-3 rounded-xl border border-[#E4E4E4] p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#F75803]", pendingIds.includes(product.id) ? "bg-[#FFEEE6]" : "bg-white")}><span className="flex min-w-0 items-center gap-3"><CategoryIcon name={pendingIds.includes(product.id) ? "checked" : "unchecked"} size={20} /><CategoryMedia media={product.media[0]} label={product.name} className="h-10 w-10 shrink-0" /><span className="truncate font-medium tracking-[-0.015em] text-[#373737]">{product.name}</span></span><span className="shrink-0 font-medium text-[#373737]">{money(product.price).replace(/\.00$/, "")}</span></button>)}{!pickerProducts.length && <p className="py-8 text-center text-[#808080]">No listings found.</p>}</div>
      </div><footer className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-t border-[#E2E4E9] px-5"><span className="leading-6 text-[#808080]">{pendingIds.length} Selected</span><div className="flex gap-3"><button type="button" onClick={cancelPicker} className={cn(categoryOutline, "h-10")}>Cancel</button><button type="button" onClick={donePicker} className={cn(categoryPrimary, "h-10")}>Done</button></div></footer>
    </>}
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
