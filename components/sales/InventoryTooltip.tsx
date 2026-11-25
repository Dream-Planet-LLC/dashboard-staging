"use client";

import { useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DesignIcon } from "./DesignIcon";

export const inventoryHints = {
  stock: { title: "On hand", description: "The total quantity of stock physically in your inventory, including both available and reserved stock." },
  available: { title: "Available", description: "The quantity of stock available for new orders." },
  reserved: { title: "Reserved", description: "The quantity of stock set aside for existing orders but not yet fulfilled." },
};

export function InventoryTooltip({ field }: { field: keyof typeof inventoryHints }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const hint = inventoryHints[field];
  const show = () => { clearTimeout(timer.current); setOpen(true); };
  const hide = () => { timer.current = setTimeout(() => setOpen(false), 150); };
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" aria-label={`About ${hint.title.toLowerCase()} stock`} onPointerEnter={show} onPointerLeave={hide} onFocus={show} className="flex h-4 w-4 shrink-0 items-center justify-center rounded outline-none focus-visible:ring-2 focus-visible:ring-[#F75803]">
          <DesignIcon name="info-dark" size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="bottom" align="start" alignOffset={-12} sideOffset={6} onOpenAutoFocus={(event) => event.preventDefault()} onCloseAutoFocus={(event) => event.preventDefault()} onPointerEnter={show} onPointerLeave={hide} className="INT400 z-[60] flex w-[280px] items-start gap-3 rounded-xl bg-[#111810] p-3 shadow-[0_1px_2px_#E4E5E73D,0_12px_24px_#868C981F] outline-none">
          <div className="w-[220px] shrink-0"><p className="text-[14px] font-medium leading-5 tracking-[-0.015em] text-white">{hint.title}</p><p className="mt-1 text-[12px] font-normal leading-4 text-[#C8C8C8]">{hint.description}</p></div>
          <Popover.Close aria-label="Close stock tooltip" className="h-6 w-6 shrink-0 rounded-full outline-none focus-visible:ring-1 focus-visible:ring-white"><DesignIcon name="close-circle" size={24} color="#C8C8C8" /></Popover.Close>
          <Popover.Arrow width={12} height={6} className="fill-[#111810]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
