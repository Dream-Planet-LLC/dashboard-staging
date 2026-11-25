"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "./CategoriesProvider";
import { CategoryEditor } from "./CategoryEditor";
import { CategoryIcon, CategoryMedia, CategorySearch, categoryPrimary, categoryTab } from "./CategoryPrimitives";

export default function CategoriesPage() {
  const { categories, summary, saveCategory } = useCategories();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [creating, setCreating] = useState(false);
  const filtered = categories.filter(category => category.name.toLowerCase().includes(query.toLowerCase()) && (tab === "all" || category.status === tab));

  return <div className="INT400 flex flex-col gap-5 text-[14px] leading-6">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-[24px] font-medium leading-8 tracking-[-0.015em] text-[#111810]">Categories ({summary.categories})</h1>
      <div className="flex flex-wrap items-center gap-3"><CategorySearch value={query} onChange={setQuery} /><button onClick={() => setCreating(true)} className={`${categoryPrimary} w-[140px]`}><CategoryIcon name="plus" size={16} />New collection</button></div>
    </header>
    <Tabs value={tab} onValueChange={setTab}><TabsList className="flex h-[41px] justify-start gap-10 rounded-none border-b border-[#F1F1F1] bg-transparent p-0"><TabsTrigger value="all" className={`${categoryTab} min-w-[54px] justify-start`}>All ({summary.all})</TabsTrigger><TabsTrigger value="PUBLISHED" className={`${categoryTab} min-w-[108px] justify-start`}>Published ({summary.published})</TabsTrigger><TabsTrigger value="ARCHIVED" className={`${categoryTab} min-w-[101px] justify-start`}>Archived ({summary.archived})</TabsTrigger></TabsList></Tabs>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {filtered.map(category => <Link key={category.id} href={`/categories/${category.id}`} aria-label={`Open ${category.name}`} className="block overflow-hidden rounded border border-[#E4E4E4] bg-white outline-none focus-visible:ring-2 focus-visible:ring-[#F75803]"><CategoryMedia media={category.picture} label={category.name} className="h-[140px] rounded-none" /><div className="flex h-[72px] items-start justify-between gap-6 p-3"><div className="min-w-0 flex-1"><h2 className="truncate text-[16px] font-medium leading-6 tracking-[-0.015em] text-[#111810]">{category.name}</h2><p className="font-normal text-[#808080]">{category.productCount} products</p></div><CategoryIcon name="arrow-up-right" size={16} className="shrink-0" /></div></Link>)}
    </div>
    {!filtered.length && <p className="py-16 text-center text-[#808080]">No categories found.</p>}
    {creating && <CategoryEditor onClose={() => setCreating(false)} onSave={draft => { saveCategory(draft); setCreating(false); }} />}
  </div>;
}
