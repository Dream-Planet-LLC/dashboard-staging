"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Category } from "@/types/categories";
import { Listing } from "@/types/listings";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCategories } from "./CategoriesProvider";
import { CategoryEditor } from "./CategoryEditor";
import { CategoryIcon, CategoryMedia, CategorySearch, categoryOutline, categoryPrimary, categoryTab } from "./CategoryPrimitives";
import { SalesSelect } from "./SalesSelect";
import { money, StatusBadge } from "./SalesPrimitives";
import { SalesTimeline } from "./SalesTimeline";
import { cn } from "@/lib/utils";

const menuStyle = "INT400 space-y-1 rounded-xl border-0 bg-white p-2 text-[14px] leading-6 shadow-[0_16px_40px_-8px_#585C5F29]";
const menuItem = "flex h-10 cursor-pointer items-center gap-2 rounded p-2 text-[14px] font-normal leading-6 text-[#373737] focus:bg-[#F7F7F7]";
const date = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function CategoryDetail({ category }: { category: Category }) {
  const { products, saveCategory, archiveCategory, deleteCategory, removeProduct } = useCategories();
  const router = useRouter();
  const [tab, setTab] = useState("products");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sort, setSort] = useState<{ key: "stock" | "status"; direction: number } | null>(null);
  const [editor, setEditor] = useState<"edit" | "products" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const filtered = useMemo(() => {
    const items = products.filter(product => category.productIds.includes(product.id) && product.name.toLowerCase().includes(query.toLowerCase()) && (status === "all" || product.status === status));
    if (sort) items.sort((a, b) => (sort.key === "stock" ? a.stock - b.stock : a.status.localeCompare(b.status)) * sort.direction);
    return items;
  }, [category.productIds, products, query, status, sort]);
  const toggleSort = (key: "stock" | "status") => setSort(current => ({ key, direction: current?.key === key ? -current.direction : 1 }));

  const actions = (product: Listing, grid = false) => <DropdownMenu>
    <DropdownMenuTrigger asChild><button aria-label={`Actions for ${product.name}`} className={cn("inline-flex items-center justify-center rounded outline-none focus-visible:ring-2 focus-visible:ring-[#F75803]", grid ? "h-6 w-6 rounded-full" : "h-5 w-5")}><CategoryIcon name={grid ? "grid-more" : "more"} size={grid ? 24 : 20} /></button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" alignOffset={grid ? 0 : -29} sideOffset={10} className={cn(menuStyle, "w-40")}>
      <DropdownMenuItem asChild className={menuItem}><Link href={`/listings/${product.id}/edit`}><CategoryIcon name="edit-gray" size={20} />Edit</Link></DropdownMenuItem>
      <DropdownMenuItem onSelect={() => removeProduct(category.id, product.id)} className={cn(menuItem, "text-[#C83532] focus:text-[#C83532]")}><CategoryIcon name="x-red" size={20} />Remove</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;

  return <div className="INT400 text-[14px] leading-6 tracking-[-0.018em] text-[#111810]">
    <header>
      <Link href="/categories" className="flex h-6 w-fit items-center gap-2 text-[#808080]"><CategoryIcon name="back" size={16} />Back to products</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-5">
        <div className="flex min-w-0 items-start gap-6">
          <CategoryMedia media={category.picture} label={category.name} className="h-[104px] w-40 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-[24px] font-medium leading-8 tracking-[-0.015em]">{category.name}</h1>
            <div className="mt-3 flex h-6 items-center gap-3"><span className="text-[#808080]">{category.productCount} products</span><span className="h-[3px] w-[3px] rounded-full bg-[#E4E4E4]" /><span className={cn("rounded-full px-2 py-1 text-[12px] font-medium leading-4 tracking-[0.06em] text-white", category.status === "PUBLISHED" ? "bg-[#2BAC47]" : "bg-[#808080]")}>{category.status}</span></div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[#808080]"><span>Created by {category.createdBy}</span><span aria-hidden="true" className="h-4 w-px bg-[#C8C8C8]" /><span className="flex items-center gap-2"><CategoryIcon name="calendar" size={20} />{date(category.createdAt)}</span><span aria-hidden="true" className="h-4 w-px bg-[#C8C8C8]" /><span className="flex items-center gap-2"><CategoryIcon name="clock" size={20} />Last updated {date(category.updatedAt)}</span></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditor("edit")} className={cn(categoryOutline, "w-[138px] text-[#F75803]")}><CategoryIcon name="edit-orange" size={20} />Edit collection</button>
          <button onClick={() => setEditor("products")} className={cn(categoryPrimary, "w-[123px]")}><CategoryIcon name="plus" size={16} />Edit product</button>
          <DropdownMenu modal={false}><DropdownMenuTrigger asChild><button aria-label="Category actions" className={cn(categoryOutline, "w-8 p-0")}><CategoryIcon name="more-gray" size={20} /></button></DropdownMenuTrigger><DropdownMenuContent align="end" sideOffset={10} className={cn(menuStyle, "w-[190px]")}><DropdownMenuItem onSelect={() => archiveCategory(category.id)} className={menuItem}><CategoryIcon name="archive" size={20} />{category.status === "PUBLISHED" ? "Archive" : "Publish"}</DropdownMenuItem><DropdownMenuItem onSelect={() => setDeleting(true)} className={cn(menuItem, "text-[#C83532] focus:text-[#C83532]")}><CategoryIcon name="trash-red" size={20} />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </div>
    </header>
    <div className={cn("mt-8 flex flex-col gap-5", view === "grid" && tab === "products" && "xl:-ml-[9px] xl:w-[calc(100%+2px)]")}>
      <Tabs value={tab} onValueChange={setTab}><TabsList className="flex h-[41px] justify-start gap-10 rounded-none border-b border-[#F1F1F1] bg-transparent p-0"><TabsTrigger value="products" className={cn(categoryTab, "min-w-[101px] justify-start after:w-[calc(100%+2px)]")}>Products ({category.productTabCount})</TabsTrigger><TabsTrigger value="activity" className={cn(categoryTab, "min-w-[56px] justify-start after:w-full")}>Activity</TabsTrigger></TabsList></Tabs>
      {tab === "products" ? <>
        <div className="flex flex-wrap items-center justify-between gap-4"><CategorySearch value={query} onChange={setQuery} label="Search category products" /><div className="flex items-center gap-3"><div className="flex overflow-hidden rounded">{(["list", "grid"] as const).map(mode => <button key={mode} aria-label={mode === "list" ? "List view" : "Grid view"} aria-pressed={view === mode} onClick={() => setView(mode)} className={cn("flex h-8 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F75803]", mode === "list" ? "w-[39px]" : "w-[40.67px]", view === mode ? "bg-[#FFEEE6]" : "bg-[#F1F1F1]")}><CategoryIcon name={mode} size={mode === "list" ? 15 : 16.67} color={view === mode ? "#F75803" : "#5B5B5B"} /></button>)}</div><SalesSelect value={status} onChange={setStatus} label="Filter category products by status" iconNamespace="categories" className="w-[104px]" options={[{ value: "all", label: "All Status" }, { value: "ACTIVE", label: "Active" }, { value: "ARCHIVED", label: "Archived" }, { value: "DRAFT", label: "Draft" }]} /></div></div>
        {view === "list" ? <div className="overflow-x-auto"><table className="w-full min-w-[800px] table-fixed border-collapse text-left">
          <colgroup>{[45.38, 15.85, 15.85, 15.85, 7.07].map((width, i) => <col key={i} style={{ width: `${width}%` }} />)}</colgroup>
          <thead className="h-10 rounded-sm bg-[#F7F7F7] leading-5 tracking-[-0.015em] text-[#808080]"><tr><th className="px-3 font-medium">Name</th><th className="px-3 font-medium">Price</th><th className="px-3 font-medium" aria-sort={sort?.key === "stock" ? sort.direction === 1 ? "ascending" : "descending" : "none"}><button onClick={() => toggleSort("stock")} className="flex items-center gap-1"><span className="min-w-[93px] text-left">Stock quantity</span><CategoryIcon name="sort" size={16} /></button></th><th className="px-3 font-medium" aria-sort={sort?.key === "status" ? sort.direction === 1 ? "ascending" : "descending" : "none"}><button onClick={() => toggleSort("status")} className="flex items-center gap-1"><span className="min-w-[41px] text-left">Status</span><CategoryIcon name="sort" size={16} /></button></th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody className="text-[#5B5B5B]"><tr aria-hidden="true" className="h-4"><td colSpan={5} /></tr>{filtered.map((product, index) => <Fragment key={product.id}><tr className="h-[72px] border-b border-[#F1F1F1] hover:bg-[#FAFAFA]"><td className="px-3"><Link href={`/listings/${product.id}`} className="flex items-center gap-3 font-medium leading-5 tracking-[-0.015em] text-[#373737]"><CategoryMedia media={product.media[0]} label={product.name} className="h-12 w-12 shrink-0" />{product.name}</Link></td><td className="px-3 font-medium leading-5 tracking-[-0.015em] text-[#373737]">{money(product.price).replace(/\.00$/, "")}</td><td className="px-3">{product.stock}</td><td className="px-3"><StatusBadge status={product.status} /></td><td className="px-3 text-center">{actions(product)}</td></tr>{index < filtered.length - 1 && <tr aria-hidden="true" className="h-1"><td colSpan={5} /></tr>}</Fragment>)}</tbody>
        </table></div>
        : <div className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2 xl:grid-cols-4">{filtered.map(product => <article key={product.id} className="overflow-hidden rounded-lg border border-[#E4E4E4]"><div className="relative h-40"><Link href={`/listings/${product.id}`} className="block h-full"><CategoryMedia media={product.media[0]} label={product.name} className="h-full rounded-none" /></Link><span className="absolute left-3 top-3"><StatusBadge status={product.status} /></span><div className="absolute right-3 top-3">{actions(product, true)}</div></div><div className="flex h-[92px] flex-col gap-0.5 p-3"><Link href={`/listings/${product.id}`} className="font-medium leading-5 tracking-[-0.015em] text-[#373737]">{product.name}</Link><p className="leading-5 text-[#808080]">{money(product.price).replace(/\.00$/, "")}</p><p className="tracking-[-0.018em] text-[#808080]">Stock quality: {product.stock}</p></div></article>)}</div>}
        {!filtered.length && <p className="py-16 text-center text-[#808080]">No listings found.</p>}
      </> : <div className="py-5 pl-4"><SalesTimeline items={category.activity} /></div>}
    </div>
    {editor && <CategoryEditor category={category} pickerOnly={editor === "products"} onClose={() => setEditor(null)} onSave={draft => { saveCategory(draft, category.id); setEditor(null); }} />}
    <Dialog open={deleting} onOpenChange={setDeleting}><DialogContent closeIcon={<CategoryIcon name="close-circle" size={24} />} className="INT400 max-w-[420px] rounded-xl"><DialogHeader><DialogTitle>Delete category?</DialogTitle><DialogDescription>Delete {category.name}? Its listings will remain available in Listings.</DialogDescription></DialogHeader><DialogFooter><button className={categoryOutline} onClick={() => setDeleting(false)}>Cancel</button><button className={cn(categoryPrimary, "bg-[#C83532]")} onClick={() => { deleteCategory(category.id); router.push("/categories"); }}>Delete category</button></DialogFooter></DialogContent></Dialog>
  </div>;
}
