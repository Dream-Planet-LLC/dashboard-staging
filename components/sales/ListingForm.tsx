"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DesignIcon } from "./DesignIcon";
import { VariantEditor } from "./VariantEditor";
import { ProductImages } from "./ProductImages";
import { SalesSelect } from "./SalesSelect";
import { Switch } from "@/components/ui/switch";
import { listingCategories, sampleProductMedia } from "@/mock/listings";
import { Listing, ListingMedia, ListingVariant } from "@/types/listings";
import { useListings } from "./ListingsProvider";
import { MediaPreview, salesButton, salesInput, salesOutlineButton, salesPanel, SalesBackLink } from "./SalesPrimitives";
import { cn } from "@/lib/utils";

export default function ListingForm({ listing }: { listing?: Listing }) {
  const { saveListing } = useListings();
  const router = useRouter();
  const [name, setName] = useState(listing?.name || "");
  const [category, setCategory] = useState(listing?.category || "");
  const [amount, setAmount] = useState(listing ? String(listing.price) : "");
  const [description, setDescription] = useState(listing?.description || "");
  const [colors, setColors] = useState(listing ? Array.from(new Set(listing.variants.map((item) => item.color))) : ["#A70000"]);
  const [sizes, setSizes] = useState(listing ? Array.from(new Set(listing.variants.map((item) => item.size))) : []);
  const [variants, setVariants] = useState<ListingVariant[]>(listing?.variants || []);
  const [media, setMedia] = useState<ListingMedia[]>(listing?.media || sampleProductMedia);
  const [published, setPublished] = useState(listing?.status === "ACTIVE" || !listing);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const rebuildVariants = (nextColors: string[], nextSizes: string[]) => {
    setColors(nextColors);
    setSizes(nextSizes);
    setVariants(nextSizes.flatMap((size) => nextColors.map((color) => variants.find((item) => item.color === color && item.size === size)
      || { id: `${size}-${color}`, size, color, price: Number(amount) || 0, stock: 0, reserved: 0 })));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const draft = button?.value === "draft";
    if (!name.trim()) { setError("Enter a product name."); return; }
    if (!draft && !category) { setError("Select a category before publishing."); return; }
    if (!draft && (!amount || !Number.isFinite(Number(amount)) || Number(amount) < 0)) { setError("Enter a valid base price before publishing."); return; }
    if (variants.some((item) => item.stock < item.reserved)) { setError("A variant's stock cannot be lower than its reserved units."); return; }
    const now = new Date().toISOString();
    const saved: Listing = {
      id: listing?.id || `listing-${crypto.randomUUID()}`,
      name: name.trim(), category: category || "Uncategorized", price: Number(amount) || 0,
      stock: variants.reduce((total, item) => total + item.stock, 0),
      status: draft ? "DRAFT" : published ? "ACTIVE" : "ARCHIVED",
      description: description.trim(), createdAt: listing?.createdAt || now,
      createdBy: listing?.createdBy || "Admin", media, variants,
      activity: [{ title: listing ? "Product updated" : draft ? "Product saved as draft" : "Product created", date: now }, ...(listing?.activity || [])],
    };
    saveListing(saved);
    router.push(`/listings/${saved.id}`);
  };

  return (
    <form onSubmit={submit} className="INT400 pb-24 text-[14px] leading-5 text-[#111810]">
      <header className="mb-6"><SalesBackLink /><h1 className="text-[24px] font-medium leading-8 tracking-[-0.015em]">{listing ? "Edit listing" : "Create new listing"}</h1></header>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,760fr)_minmax(0,320fr)]">
        <div className="min-w-0 space-y-6">
          <section className={salesPanel} aria-labelledby="basic-information">
            <h2 id="basic-information" className="mb-5 font-medium text-black">Basic information</h2>
            <div className="space-y-5">
              <div><label htmlFor="product-name" className="mb-1 block font-medium text-[#0A0D14]">Product name<span aria-hidden="true">*</span></label><input id="product-name" autoComplete="off" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={salesInput} placeholder="e.g. Oversized T-shirt" /></div>
              <div><label id="category-label" className="mb-1 block font-medium text-[#0A0D14]">Category<span aria-hidden="true">*</span></label><SalesSelect value={category} onChange={setCategory} label="Category" placeholder="Select category" className={cn(salesInput, "h-10 rounded-[10px] text-[#808080]")} options={Array.from(new Set([...listingCategories, ...(listing ? [listing.category] : [])])).map((value) => ({ value, label: value }))} /></div>
              <div><label htmlFor="product-amount" className="mb-1 block font-medium text-[#0A0D14]">Amount</label><div className="relative"><span className="absolute left-3 top-3 text-[#808080]">$</span><input id="product-amount" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className={cn(salesInput, "h-11 pl-7")} placeholder="0.00" aria-describedby="amount-hint" /></div><p id="amount-hint" className="mt-1 flex h-7 items-center gap-1 leading-6 text-[#808080]"><DesignIcon name="info" size={16} className="shrink-0" />This will serve as the base price but can be altered later</p></div>
              <div><label htmlFor="product-description" className="mb-1 block font-medium text-[#0A0D14]">Description</label><div className="relative"><textarea id="product-description" maxLength={200} value={description} onChange={(event) => setDescription(event.target.value)} className={cn(salesInput, "block h-[140px] resize-y rounded-xl py-3 pb-7")} placeholder="Tell your customers about this product..." /><span className="pointer-events-none absolute bottom-3 right-8 text-[10px] text-[#868C98]">{description.length}/200</span></div></div>
            </div>
          </section>
          <VariantEditor colors={colors} sizes={sizes} variants={variants} basePrice={Number(amount) || 0} onOptionsChange={rebuildVariants} onChange={setVariants} />
        </div>
        <div className="space-y-6">
          <ProductImages media={media} onChange={setMedia} onError={setError} uploading={uploading} onUploadingChange={setUploading} />
          {listing && <section className={salesPanel}><div className="flex items-center justify-between gap-3"><label htmlFor="published-status" className="font-medium">Published</label><Switch id="published-status" checked={published} onCheckedChange={setPublished} className="data-[state=checked]:bg-[#F75803]" /></div><p className="mt-1 text-[12px] leading-4 text-[#808080]">Your product will be visible in the store once published.</p></section>}
        </div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg bg-[#FFF1F0] p-3 text-[#C83532]">{error}</p>}
      <footer className="fixed inset-x-0 bottom-0 z-20 flex h-20 items-center justify-end gap-3 border-t border-[#E4E4E4] bg-white px-4 shadow-[0_-1px_2px_#122B690A] md:left-[264px] md:px-8"><button type="submit" value="draft" disabled={uploading} className={salesOutlineButton}>Save as draft</button><button type="submit" value="publish" disabled={uploading} className={salesButton}>{listing ? "Save changes" : "Publish product"}</button></footer>
    </form>
  );
}
