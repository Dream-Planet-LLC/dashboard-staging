// Sample order and pickup options from ship.figcraft. Booking is local UI state.
export const shippingCarriers = ["DHL Express", "FedEx", "UPS", "Aramex", "GIG Logistics"];
export const shippingCarrierImages: Record<string, string> = {
  "DHL Express": "/images/shipping/dhl.svg",
  FedEx: "/images/shipping/fedex.svg",
  UPS: "/images/shipping/ups.png",
  Aramex: "/images/shipping/aramex.svg",
  "GIG Logistics": "/images/shipping/gig.png",
};
export const shippingCourierAddress = "742 Evergreen Terrace, Springfield, IL 62704";
export const pickupDates = [
  { id: "2026-11-16", weekday: "MON", day: 16, label: "Mon, 16 Nov" },
  { id: "2026-11-17", weekday: "TUE", day: 17, label: "Tue, 17 Nov" },
  { id: "2026-11-18", weekday: "WED", day: 18, label: "Wed, 18 Nov" },
  { id: "2026-11-19", weekday: "THU", day: 19, label: "Thu, 19 Nov" },
  { id: "2026-11-20", weekday: "FRI", day: 20, label: "Fri, 20 Nov" },
];
export const pickupTimes = ["09:00 - 11:00", "11:00 - 13:00", "13:00 - 15:00", "15:00 - 17:00"];
export const shippingOrder = {
  id: "ORD-4582",
  address: "Jane Doe, 12 Freedom Street, Lekki Phase 1, Lagos 106104",
  products: ["Black", "Green", "Yellow"].map(color => ({ name: "Backstage Energy Hoodie", color, quantity: 2, price: "$900", image: "/images/shipping/hoodie.jpg" })),
  itemsLabel: "Items(4)", itemsTotal: "$99,000", carrierPrice: "$28.75", shippingPrice: "$3,500", total: "102,500",
  bookingReference: "ZX9Q-4721",
};
