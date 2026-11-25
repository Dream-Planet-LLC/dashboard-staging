"use client";

import ListingDetail from "@/components/sales/ListingDetail";
import { useListings } from "@/components/sales/ListingsProvider";
import { SalesBackLink } from "@/components/sales/SalesPrimitives";
import { useCategories } from "@/components/sales/CategoriesProvider";

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { listings } = useListings();
  const { products } = useCategories();
  const listing = listings.find((item) => item.id === params.id) || products.find((item) => item.id === params.id);
  if (!listing) return <div className="INT400"><SalesBackLink /><p className="mt-6 text-[#808080]">This listing could not be found.</p></div>;
  return <ListingDetail key={listing.id} listing={listing} />;
}
