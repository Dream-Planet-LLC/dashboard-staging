import { Category } from "@/types/categories";
import { Listing } from "@/types/listings";
import { sampleListings } from "./listings";

// Visible sample records and summary counts from cat.figcraft.
export const categoryProducts: Listing[] = [
  ["Riverside Indigo Denim Jacket", 13],
  ["Blue Ridge Classic Jeans", 72],
  ["Sunset Wash Denim Shirt", 36],
  ["Midtown Slim Fit Jeans", 24],
  ["Harbor Stretch Denim Jacket", 17],
  ["Canyon Raw Edge Denim Shirt", 32],
].map(([name, stock], index) => ({
  ...sampleListings[0],
  id: "category-product-" + (index + 1),
  name: String(name),
  category: "Urban Denim",
  price: 245,
  stock: Number(stock),
  status: index === 4 ? "ARCHIVED" : "ACTIVE",
  media: [],
  variants: [{ id: "denim-variant-" + index, size: "M", color: "#0B0C0E", price: 245, stock: Number(stock), reserved: 0 }],
}));

const rows: [string, string, number][] = [
  ["activewear", "Activewear Collection", 102],
  ["native-wear", "Native wear", 32],
  ["urban-denim", "Urban Denim", 98],
  ["cozy-knitwear", "Cozy Knitwear", 10],
  ["casual-basics", "Casual Basics", 22],
  ["eveningwear", "Elegant Eveningwear", 13],
  ["accessories", "Vintage Accessories", 5],
];

export const sampleCategories: Category[] = rows.map(([id, name, productCount], index) => ({
  id,
  name,
  picture: { url: "/images/categories/photos/" + id + ".jpg", name: name + " picture", type: "image/jpeg" },
  productIds: id === "urban-denim" ? categoryProducts.map(product => product.id) : sampleListings.map(product => product.id),
  productCount,
  productTabCount: id === "urban-denim" ? 89 : productCount,
  status: index === 6 ? "ARCHIVED" : "PUBLISHED",
  createdBy: "Jane Doe",
  createdAt: "2025-10-24T10:00:00.000Z",
  updatedAt: "2026-10-24T10:00:00.000Z",
  activity: [{ title: "Category updated", date: "2026-10-24T10:00:00.000Z" }, { title: "Category created by Jane Doe", date: "2025-10-24T10:00:00.000Z" }],
}));
