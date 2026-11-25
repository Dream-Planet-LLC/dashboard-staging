"use client";

import Link from "next/link";
import { useCategories } from "@/components/sales/CategoriesProvider";
import { CategoryDetail } from "@/components/sales/CategoryDetail";

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
  const { categories } = useCategories();
  const category = categories.find(item => item.id === params.id);
  return category ? <CategoryDetail key={category.id} category={category} /> : <div className="INT400 py-16 text-center"><h1 className="text-xl font-medium">Category not found</h1><Link href="/categories" className="mt-4 inline-block text-[#F75803]">Back to categories</Link></div>;
}
