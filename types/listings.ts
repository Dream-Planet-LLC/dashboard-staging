export type ListingStatus = "ACTIVE" | "ARCHIVED" | "DRAFT";

export type ListingMedia = { url: string; name: string; type: string };
export type ListingVariant = {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  reserved: number;
};
export type Listing = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ListingStatus;
  description: string;
  createdAt: string;
  createdBy: string;
  media: ListingMedia[];
  variants: ListingVariant[];
  activity: { title: string; date: string }[];
};

export type ListingOrderStatus = "PROCESSING" | "PENDING" | "CANCELLED" | "SHIPPED" | "DELIVERED";
export type ListingOrder = {
  id: string;
  customer: string;
  color: string;
  size: string;
  quantity: number;
  amount: number;
  status: ListingOrderStatus;
  date: string;
  creator: string;
  summary?: {
    items: { name: string; color: string; quantity: number; amount: number; media?: ListingMedia }[];
    shipping: number;
    deliveryFee: number;
    total: number;
    recipient: string;
    address: string;
    phone: string;
    email: string;
  };
};
