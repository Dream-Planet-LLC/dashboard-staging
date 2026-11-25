import { Listing, ListingMedia, ListingOrder } from "@/types/listings";

export const listingCategories = ["Accessories", "Backpack", "Cap", "Hoodie", "Shirt"];
export const listingColors = [
  { name: "Black", value: "#0B0C0E" },
  { name: "Red", value: "#A70000" },
  { name: "Orange", value: "#FF9300" },
  { name: "Pink", value: "#F89497" },
  { name: "Blue", value: "#1E7ADF" },
  { name: "Purple", value: "#6C4DAD" },
  { name: "Magenta", value: "#B3467B" },
  { name: "Navy", value: "#0057D4" },
];
export const listingSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const productPhotoIds = ["photo-1521572163474-6864f9cf17ab", "photo-1588850561407-ed78c282e89b", "photo-1556821840-3a63f95609a7", "photo-1553062407-98eeb64c6a62", "photo-1601924994987-69e26d50dc26", "photo-1576871337622-98d48d1cf531"];
const productPhoto = (index: number): ListingMedia => ({ url: `https://images.unsplash.com/${productPhotoIds[index]}?auto=format&fit=crop&w=800&q=85`, name: `Product photo ${index + 1}`, type: "image/jpeg" });
export const sampleProductMedia = [productPhoto(0), productPhoto(1), productPhoto(2)];

// Sample content from listing.figcraft. Sales endpoints are not yet available.
const sampleRows: Array<[string, string, number, number, Listing["status"]]> = [
  ["Midnight Tour Dad Cap", "Cap", 140, 67, "ACTIVE"],
  ["Midnight Tour Dad Cap", "Cap", 140, 67, "ACTIVE"],
  ["Midnight Tour Dad Cap", "Cap", 140, 67, "ARCHIVED"],
  ["Midnight Tour Dad Cap", "Cap", 140, 67, "ACTIVE"],
];

export const sampleListings: Listing[] = sampleRows.map(([name, category, price, stock, status], index) => ({
  id: `listing-${index + 1}`,
  name,
  category,
  price,
  stock,
  status,
  description: "A thoughtfully designed essential for your collection. Made for everyday comfort and a style that stands out.",
  createdAt: "2026-08-25T10:00:00.000Z",
  createdBy: "Collins Osazee",
  media: [productPhoto(1), productPhoto(1), productPhoto(1), productPhoto(1)],
  variants: [
    { id: `variant-${index}-1`, size: "S", color: "#0B0C0E", price, stock: Math.floor(stock / 3), reserved: 4 },
    { id: `variant-${index}-2`, size: "M", color: "#B3467B", price, stock: stock - Math.floor(stock / 3), reserved: 2 },
    { id: `variant-${index}-3`, size: "L", color: "#0057D4", price, stock: 0, reserved: 0 },
  ],
  activity: [
    { title: "Emeka Emmanuel updated product price", date: "2026-11-10T09:12:00" },
    { title: "Jane Doe updated product price", date: "2026-11-10T09:14:00" },
    { title: "Stock increased by 20 units", date: "2026-11-10T09:14:00" },
    { title: `Product added to ${category}`, date: "2026-08-25T10:05:00" },
    { title: "Product created", date: "2026-08-25T10:00:00" },
  ],
}));

export const sampleListingOrders: ListingOrder[] = (["PROCESSING", "PENDING", "CANCELLED", "SHIPPED", "DELIVERED"] as const).map((status, index) => ({
  id: `ORD-${4590 - index}`,
  customer: "Ada Nwosu",
  color: "#0B0D0F",
  size: "M",
  quantity: 2,
  amount: 248,
  status,
  date: "2026-11-11T10:42:00",
  creator: "Jordan Miller",
  // Order-summary sample values supplied in the second FigCraft section.
  summary: {
    items: ["Black", "Green", "Yellow"].map(color => ({ name: "Backstage Energy Hoodie", color, quantity: 2, amount: 900, media: productPhoto(2) })),
    shipping: 3500,
    deliveryFee: 99000,
    total: 102500,
    recipient: "Adaeze Okafor",
    address: "14 Admiralty way, Lekki phase 1, Lagos. Nigeria",
    phone: "+234 0000 0000 0000",
    email: "adaeze.okafor@example.com",
  },
}));
