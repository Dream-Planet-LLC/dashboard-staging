"use client";

import * as Select from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { DesignIcon } from "./DesignIcon";

type SalesSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; color?: string }[];
  label: string;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  colorOnly?: boolean;
  compact?: boolean;
  iconName?: string;
  iconNamespace?: "sales" | "categories";
};

export function SalesSelect({ value, onChange, options, label, placeholder, className, menuClassName, colorOnly, compact, iconName = "chevron", iconNamespace = "sales" }: SalesSelectProps) {
  const selected = options.find((option) => option.value === value);
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger aria-label={label} className={cn("flex h-8 items-center justify-between gap-2 whitespace-nowrap rounded border border-[#F1F1F1] bg-white px-2 text-[14px] font-normal leading-6 text-[#5B5B5B] outline-none focus-visible:ring-1 focus-visible:ring-[#F75803]", className)}>
        {colorOnly ? <><span className="h-5 w-5 shrink-0 rounded-full" style={{ backgroundColor: value }} /><span className="sr-only">{selected?.label || value}</span></> : <Select.Value placeholder={placeholder} />}
        <Select.Icon asChild><span className="shrink-0"><DesignIcon namespace={iconNamespace} name={iconName} size={20} /></span></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" sideOffset={4} align="start" className={cn("INT400 z-50 max-h-[360px] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-[#E2E4E9] bg-white p-1 shadow-[0_2px_4px_#122B6914,0_4px_8px_#122B690A]", menuClassName)}>
          <Select.Viewport className="max-h-[352px]">
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value} className={cn("flex cursor-pointer select-none items-center gap-3 rounded px-3 text-[14px] font-medium leading-5 tracking-[-0.015em] text-[#111810] outline-none data-[state=checked]:bg-[#F1F5F9] data-[highlighted]:bg-[#F1F5F9]", compact ? "h-9" : "h-12")}>
                <span className="flex flex-1 items-center gap-2 whitespace-nowrap">
                  {option.color && <span className="h-5 w-5 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />}
                  <Select.ItemText>{option.label}</Select.ItemText>
                </span>
                <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                  <Select.ItemIndicator><DesignIcon name="check" size={18} color="#F75803" /></Select.ItemIndicator>
                </span>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
