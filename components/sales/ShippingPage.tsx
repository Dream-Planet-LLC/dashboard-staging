"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { pickupDates, pickupTimes, shippingCarriers, shippingCarrierImages, shippingCourierAddress, shippingOrder } from "@/mock/shipping";
import { DesignIcon } from "./DesignIcon";
import { salesButton, salesInput, salesOutlineButton } from "./SalesPrimitives";

type ShippingMethod = "pickup" | "dropoff" | "tracking";
const methods: { id: ShippingMethod; label: string; icon: string }[] = [
  { id: "pickup", label: "Schedule pickup", icon: "truck" },
  { id: "dropoff", label: "Courier drop-off", icon: "storefront" },
  { id: "tracking", label: "Provide tracking", icon: "barcode" },
];
const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F75803] focus-visible:ring-offset-2";
const medium = "text-[14px] font-medium leading-5 tracking-[-0.015em]";
const regular = "text-[14px] font-normal leading-6 tracking-[-0.018em]";

function ShipIcon({ name, size = 20, color }: { name: string; size?: number; color?: string }) {
  return <DesignIcon namespace="shipping" name={name} size={size} color={color} />;
}

function SummaryField({ label, icon, children }: { label: string; icon: string; children: ReactNode }) {
  return <div className="flex flex-col gap-2">
    <p className="text-[12px] font-normal leading-4 text-[#808080]">{label}</p>
    <div className={cn("flex items-start gap-2", regular)}><span className="flex h-6 shrink-0 items-center"><ShipIcon name={icon} /></span><div className="min-w-0 flex-1">{children}</div></div>
  </div>;
}

function SummaryDivider({ full = false }: { full?: boolean }) {
  return <div className={cn("relative h-0", full && "-mx-6")}><div className="absolute inset-x-0 top-0 border-t border-[#E4E4E4]/50" /></div>;
}

function TrackingForm({ courier, tracking, price, saved, onCourier, onTracking, onPrice }: {
  courier: string; tracking: string; price: string; saved: boolean;
  onCourier: (value: string) => void; onTracking: (value: string) => void; onPrice: (value: string) => void;
}) {
  const fields = [
    { id: "shipping-courier-name", label: "Courier name", placeholder: "Name of the courier you used", value: courier, onChange: onCourier },
    { id: "shipping-tracking-number", label: "Tracking ID", placeholder: "Tracking ID from your courier receipt", value: tracking, onChange: onTracking },
    { id: "shipping-price", label: "Shipping price ($)", placeholder: "0.00", value: price, onChange: onPrice },
  ];
  return <div className="flex flex-col gap-5">
    {fields.map(field => <div key={field.id}>
      <label htmlFor={field.id} className="mb-1 flex items-center gap-1 text-[14px] font-medium leading-5 tracking-[-0.006em] text-[#0A0D14]">{field.label}<span aria-hidden="true" className="text-[#375DFB]">*</span></label>
      <input id={field.id} required disabled={saved} value={field.value} onChange={event => field.onChange(event.target.value)} placeholder={field.placeholder} inputMode={field.id === "shipping-price" ? "decimal" : "text"} className={cn(salesInput, "font-normal leading-5 tracking-[-0.006em]", saved && "border-transparent bg-[#F6F8FA] text-[#CDD0D5] shadow-none")} />
    </div>)}
  </div>;
}

export default function ShippingPage() {
  const [method, setMethod] = useState<ShippingMethod>("pickup");
  const [carrier, setCarrier] = useState<string | null>(null);
  const [dateId, setDateId] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [tracking, setTracking] = useState("");
  const [trackingCourier, setTrackingCourier] = useState("");
  const [shippingPrice, setShippingPrice] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [error, setError] = useState("");
  const date = pickupDates.find(option => option.id === dateId);
  const pickupLabel = date ? `${date.label}${time ? `, ${time}` : ", choose a time"}` : "Choose a date & time";
  const methodLabel = method === "pickup" ? "Scheduled pickup" : "Courier drop-off";
  const hasPickupFee = method === "pickup" && carrier !== null;
  const footerLabel = method === "pickup" ? "Confirm & ship" : method === "dropoff" ? "Create drop off booking" : "Save shipping details";
  const confirmationMessage = method === "pickup" && date && time
    ? `Your booking is confirmed! Your booking is scheduled for ${date.day} November at ${Number(time.slice(0, 2)) > 12 ? Number(time.slice(0, 2)) - 12 : Number(time.slice(0, 2))}:00 ${Number(time.slice(0, 2)) >= 12 ? "PM" : "AM"}.`
    : method === "dropoff" ? `Your parcel booking has been successfully registered with ${carrier}. You can now drop off your parcel at a ${carrier} location.` : `Shipment details saved for ${trackingCourier.trim()}.`;

  function chooseMethod(value: ShippingMethod) {
    if (value !== method) { setCarrier(null); setDateId(null); setTime(null); }
    setMethod(value); setConfirmed(false); setError("");
  }
  function chooseCarrier(value: string) {
    if (value !== carrier) { setDateId(null); setTime(null); setConfirmed(false); }
    setCarrier(value); setError("");
  }
  function confirmShipment() {
    if (method === "tracking") {
      if (!trackingCourier.trim()) { setError("Enter the courier name to continue."); return; }
      if (!tracking.trim()) { setError("Enter the tracking ID to continue."); return; }
      if (!shippingPrice.trim() || !Number.isFinite(Number(shippingPrice)) || Number(shippingPrice) < 0) { setError("Enter a valid shipping price to continue."); return; }
    } else {
      if (!carrier) { setError("Choose a courier to continue."); return; }
      if (method === "pickup" && (!date || !time)) { setError("Choose a pickup date and time to continue."); return; }
    }
    setError(""); setConfirmed(true); setSummaryOpen(true);
  }

  return <div className="INT400 pb-24 text-[#111810]">
    <div className={cn("grid items-start gap-6", summaryOpen && "xl:grid-cols-[minmax(0,1fr)_360px]")}>
      <section aria-label="Shipping options" className={cn("min-w-0", !summaryOpen && "max-w-[720px]")}>
        <header>
          <Link href="/listings" className={cn("flex h-6 w-fit items-center gap-2 text-[#808080]", regular, focus)}><ShipIcon name="back" size={16} />Back to products</Link>
          <h1 className="mt-0.5 text-[24px] font-medium leading-8 tracking-[-0.015em]">Shipping</h1>
          <div className="mt-0.5 flex h-6 items-center gap-3">
            <span className={cn("w-[118px] text-[#808080]", regular)}>Order #{shippingOrder.id}</span>
            <span className="h-[3px] w-[3px] rounded-full bg-[#E4E4E4]" />
            <span className="w-[116px] rounded-[32px] bg-[#2BAC47] px-2 py-1 text-center text-[12px] font-medium leading-4 tracking-[0.06em] text-white">READY TO SHIP</span>
          </div>
        </header>

        <div aria-label="Shipping method" role="tablist" className="mt-6 flex flex-wrap gap-3">
          {methods.map(option => <button key={option.id} type="button" role="tab" aria-selected={method === option.id} aria-controls={`shipping-${option.id}`} id={`shipping-tab-${option.id}`} onClick={() => chooseMethod(option.id)} className={cn("flex h-10 w-[162px] items-center justify-center gap-2 rounded-lg border bg-white text-[#5B5B5B]", medium, focus, method === option.id ? "bg-[#FFEEE6] text-[#F75803]" : "border-[#E4E4E4]", method === option.id && (method === "tracking" ? "border-[#E4E4E4]" : "border-transparent"))}>
            <ShipIcon name={option.icon} color={method === option.id ? "#F75803" : undefined} />{option.label}
          </button>)}
        </div>

        <div id={`shipping-${method}`} role="tabpanel" aria-labelledby={`shipping-tab-${method}`} className="mt-8 flex flex-col gap-4">
          {method !== "tracking" && <div role="radiogroup" aria-label="Couriers" className="flex flex-col gap-4">
            {shippingCarriers.map(name => {
              const selected = carrier === name;
              const expanded = selected && method === "pickup";
              return <div key={name} data-carrier={name} className={cn("overflow-hidden rounded-lg border border-[#E4E4E4] bg-white", selected && method === "pickup" && "border-0 p-[1.5px] shadow-[inset_0_0_0_1.5px_#F75803]")}>
                <button type="button" role="radio" aria-checked={selected} aria-label={name} onClick={() => chooseCarrier(name)} className={cn("flex w-full items-center gap-[14px] px-4 pt-4 text-left", expanded ? "pb-[14px]" : "pb-4", focus)}>
                  <span className="relative h-5 w-5 shrink-0"><span className="absolute left-0 top-0"><ShipIcon name={selected ? "radio-checked" : "radio-unchecked"} size={22} /></span></span>
                  <img src={shippingCarrierImages[name]} alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain" />
                  <span className="min-w-0">
                    <span className={cn("block", medium)}>{method === "dropoff" && name === "FedEx" ? "Fedex" : name}</span>
                    {method === "dropoff" && <span className="mt-0.5 block text-[12px] font-normal leading-4 text-[#808080]">{shippingCourierAddress}</span>}
                  </span>
                  {method === "pickup" && <span className="ml-auto pl-2 text-[12px] font-medium leading-4 tracking-[0.06em]">{shippingOrder.carrierPrice}</span>}
                </button>
                {expanded && <>
                  <div className="h-px bg-[#E4E4E4]" />
                  <div className="px-4 pb-4 pt-[14px]">
                    {confirmed ? <>
                      <p className={cn("flex items-center gap-2", medium)}><ShipIcon name="package" />Pickup scheduled</p>
                      <div className={cn("mt-2 flex min-h-10 flex-wrap items-center gap-x-8 gap-y-2 rounded-lg bg-[#F1F1F1] px-2 py-2", regular)}>
                        <span className="flex items-center gap-2"><ShipIcon name="calendar" />{date?.label}</span><span className="flex items-center gap-2"><ShipIcon name="clock" />{time}</span>
                      </div>
                    </> : <>
                      <p className={cn("flex items-center gap-2", medium)}><ShipIcon name="calendar" />Pickup date</p>
                      <div role="group" aria-label="Pickup date" className={cn("mt-2 flex flex-wrap", date ? "gap-2" : "gap-[10px]")}>
                        {pickupDates.map(option => <button type="button" key={option.id} aria-label={`${option.weekday}, ${option.day} November 2026`} aria-pressed={dateId === option.id} onClick={() => { setDateId(option.id); setTime(null); setError(""); }} className={cn("flex w-[68px] flex-col items-center justify-center gap-0.5 rounded-lg border border-[#E4E4E4] bg-white text-[12px] font-normal leading-4", focus, date ? "h-11" : "h-[46px]", dateId === option.id && "border-[#F75803] bg-[#FFEEE6]")}>
                          <span className={dateId === option.id ? "text-[#F75803]" : "text-[#5B5B5B]"}>{option.weekday}</span><span className={dateId === option.id ? "text-[#7E2D02]" : "text-[#111810]"}>{option.day} Nov</span>
                        </button>)}
                      </div>
                      {date && <div className="mt-5">
                        <p className={cn("flex items-center gap-2", medium)}><ShipIcon name="clock" />Pickup time</p>
                        <div role="group" aria-label="Pickup time" className="mt-2 flex flex-wrap gap-2">
                          {pickupTimes.map((option, index) => <button key={option} type="button" aria-pressed={time === option} onClick={() => { setTime(option); setError(""); }} style={{ width: [101, 98, 100, 99][index] }} className={cn("h-[34px] rounded-lg border border-[#E4E4E4] bg-white text-[12px] font-normal leading-4", focus, time === option && "border-[#F75803] bg-[#FFEEE6] text-[#7E2D02]")}>{option}</button>)}
                        </div>
                      </div>}
                    </>}
                  </div>
                </>}
              </div>;
            })}
          </div>}
          {method === "tracking" && <TrackingForm courier={trackingCourier} tracking={tracking} price={shippingPrice} saved={confirmed} onCourier={value => { setTrackingCourier(value); setError(""); }} onTracking={value => { setTracking(value); setError(""); }} onPrice={value => { setShippingPrice(value); setError(""); }} />}
          {error && <p role="alert" className="rounded-lg bg-[#FFEEE6] p-3 text-[14px] leading-5 text-[#F75803]">{error}</p>}
          {!summaryOpen && <button type="button" onClick={() => setSummaryOpen(true)} className={cn(salesOutlineButton, "w-fit")}><ShipIcon name="package" />Show order summary</button>}
        </div>
      </section>

      {summaryOpen && <aside aria-label="Order summary" className="min-w-0 rounded-lg border border-[#E4E4E4] bg-white">
        <div className="flex h-20 items-center justify-between px-6 py-6">
          <h2 className="text-[20px] font-medium leading-7">Order summary</h2>
          <button type="button" aria-label="Close order summary" title="Close order summary" onClick={() => setSummaryOpen(false)} className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#F1F1F1]", focus)}><ShipIcon name="close" /></button>
        </div>
        <div className="flex flex-col gap-6 px-6 pb-6">
          <div className="flex flex-col gap-4">
            {shippingOrder.products.map((product, index) => <div key={product.color}>
              {index > 0 && <div className="mb-4"><SummaryDivider /></div>}
              <div className="flex h-12 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={product.image} alt={product.name} width={48} height={48} className="h-12 w-12 shrink-0 rounded-[2px] object-cover" />
                  <div className="min-w-0">
                    <p className={cn("truncate", medium)}>{product.name}</p>
                    <p className={cn("flex items-center gap-1.5 text-[#A4A4A4]", regular)}>{product.color}<span className="h-[3px] w-[3px] rounded-full bg-[#E4E4E4]" />Qty {product.quantity}</p>
                  </div>
                </div>
                <span className={cn("shrink-0", regular)}>{product.price}</span>
              </div>
            </div>)}
          </div>
          <SummaryDivider full />
          <div className="flex flex-col gap-4">
            <SummaryField label="Ship to" icon="map-pin">{shippingOrder.address}</SummaryField>
            {method === "pickup" && carrier && <SummaryField label="Courier" icon="truck">{carrier}</SummaryField>}
            <SummaryField label="Method" icon="package">{methodLabel}</SummaryField>
            {method === "pickup" && <SummaryField label="Pickup" icon="calendar">{pickupLabel}</SummaryField>}
            {method === "tracking" && <><SummaryField label="Courier" icon="warehouse">{trackingCourier.trim() || "Not provided"}</SummaryField><SummaryField label="Tracking ID" icon="barcode">{tracking.trim() || "Not provided"}</SummaryField></>}
            {method === "dropoff" && confirmed && <SummaryField label="Courier address" icon="warehouse"><span className="xl:whitespace-nowrap">{shippingCourierAddress}</span></SummaryField>}
            {confirmed && method !== "tracking" && <SummaryField label="Booking reference" icon={method === "pickup" ? "calendar" : "package"}>Ref: {shippingOrder.bookingReference}</SummaryField>}
          </div>
          <SummaryDivider full />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex h-6 items-center justify-between"><span className={cn("text-[#A4A4A4]", regular)}>{method === "tracking" ? "Shipping (Paid seperately)" : "Shipping"}</span><span className={medium}>{hasPickupFee ? shippingOrder.shippingPrice : "$0"}</span></div>
              <div className="flex h-6 items-center justify-between"><span className={cn("text-[#A4A4A4]", regular)}>{shippingOrder.itemsLabel}</span><span className={medium}>{shippingOrder.itemsTotal}</span></div>
            </div>
            <SummaryDivider />
            <div className="flex h-6 items-center justify-between text-[16px] font-medium leading-6 tracking-[-0.015em]"><span>Total</span><span>{hasPickupFee ? shippingOrder.total : shippingOrder.itemsTotal}</span></div>
            {confirmed && <div role="status" className={cn("flex items-start gap-3 rounded-lg bg-[#F1F8F2] px-3 py-4 text-[#2BAC47]", method === "pickup" ? "min-h-[92px]" : method === "dropoff" ? "min-h-[112px]" : "min-h-[72px]")}><ShipIcon name="info-green" /><p className={medium}>{confirmationMessage}</p></div>}
          </div>
        </div>
      </aside>}
    </div>
    {!confirmed && <footer className="fixed inset-x-0 bottom-0 z-20 flex h-20 items-center justify-end border-t border-[#E4E4E4] bg-white px-4 md:left-[264px] md:px-8">
      <button type="button" onClick={confirmShipment} className={cn(salesButton, "tracking-[-0.015em]", method === "pickup" ? "w-[120px] leading-6" : method === "dropoff" ? "w-[178px] leading-5" : "w-[160px] leading-5")}>{footerLabel}</button>
    </footer>}
  </div>;
}
