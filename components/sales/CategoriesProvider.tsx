"use client";

import { createContext, useContext, useState } from "react";
import { categoryProducts, sampleCategories } from "@/mock/categories";
import { Category, CategoryDraft } from "@/types/categories";
import { Listing } from "@/types/listings";
import { useListings } from "./ListingsProvider";

type CategoriesContextValue = {
  categories: Category[];
  products: Listing[];
  summary: { categories: number; all: number; published: number; archived: number };
  saveCategory: (draft: CategoryDraft, id?: string) => Category;
  archiveCategory: (id: string) => void;
  deleteCategory: (id: string) => void;
  removeProduct: (id: string, productId: string) => void;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { listings } = useListings();
  const [categories, setCategories] = useState(sampleCategories);
  const products = [...listings, ...categoryProducts.filter(product => !listings.some(item => item.id === product.id))];
  const published = categories.filter(category => category.status === "PUBLISHED").length;

  const saveCategory = (draft: CategoryDraft, id?: string) => {
    const current = categories.find(category => category.id === id);
    const now = new Date().toISOString();
    const ids = Array.from(new Set(draft.productIds));
    const delta = ids.length - (current?.productIds.length || 0);
    const saved: Category = {
      id: id || "category-" + crypto.randomUUID(),
      name: draft.name.trim(), picture: draft.picture, productIds: ids,
      productCount: Math.max(0, (current?.productCount || 0) + delta),
      productTabCount: Math.max(0, (current?.productTabCount || 0) + delta),
      status: current?.status || "PUBLISHED",
      createdBy: current?.createdBy || "Admin",
      createdAt: current?.createdAt || now, updatedAt: now,
      activity: [{ title: current ? "Category updated" : "Category created", date: now }, ...(current?.activity || [])],
    };
    setCategories(items => current ? items.map(category => category.id === saved.id ? saved : category) : [...items, saved]);
    return saved;
  };

  const archiveCategory = (id: string) => setCategories(items => items.map(category => category.id === id ? { ...category, status: category.status === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED", updatedAt: new Date().toISOString(), activity: [{ title: category.status === "PUBLISHED" ? "Category archived" : "Category published", date: new Date().toISOString() }, ...category.activity] } : category));
  const removeProduct = (id: string, productId: string) => {
    const category = categories.find(item => item.id === id);
    if (category) saveCategory({ ...category, productIds: category.productIds.filter(product => product !== productId) }, id);
  };

  return <CategoriesContext.Provider value={{ categories, products, summary: { categories: 51 + categories.length - 7, all: 89 + categories.length - 7, published: 69 + published - 6, archived: 20 + categories.length - published - 1 }, saveCategory, archiveCategory, removeProduct, deleteCategory: id => setCategories(items => items.filter(category => category.id !== id)) }}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error("useCategories must be used inside CategoriesProvider");
  return context;
}
