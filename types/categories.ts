import { ListingMedia } from "./listings";

export type Category = {
  id: string;
  name: string;
  picture?: ListingMedia;
  productIds: string[];
  productCount: number;
  productTabCount: number;
  status: "PUBLISHED" | "ARCHIVED";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  activity: { title: string; date: string }[];
};

export type CategoryDraft = { name: string; picture?: ListingMedia; productIds: string[] };
