"use client";

import { createContext, useContext, useState } from "react";
import { sampleListings } from "@/mock/listings";
import { Listing } from "@/types/listings";

type ListingsContextValue = {
  listings: Listing[];
  saveListing: (listing: Listing) => void;
  setStatus: (id: string, status: Listing["status"]) => void;
  deleteListing: (id: string) => void;
};

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState(sampleListings);

  const saveListing = (listing: Listing) => {
    setListings((current) => current.some((item) => item.id === listing.id)
      ? current.map((item) => item.id === listing.id ? listing : item)
      : [listing, ...current]);
  };

  const setStatus = (id: string, status: Listing["status"]) => {
    setListings((current) => current.map((item) => item.id === id
      ? { ...item, status, activity: [{ title: `Product ${status === "ACTIVE" ? "published" : status === "ARCHIVED" ? "archived" : "saved as draft"}`, date: new Date().toISOString() }, ...item.activity] }
      : item));
  };

  return (
    <ListingsContext.Provider value={{ listings, saveListing, setStatus, deleteListing: (id) => setListings((current) => current.filter((item) => item.id !== id)) }}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) throw new Error("useListings must be used inside ListingsProvider");
  return context;
}
