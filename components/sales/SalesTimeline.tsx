import { DesignIcon } from "./DesignIcon";
import { cn } from "@/lib/utils";

export function SalesTimeline({ items }: { items: { title: string; date?: string; waiting?: boolean }[] }) {
  return (
    <ol className="relative space-y-6 border-l border-[#E4E4E4] pl-[23px]">
      {items.map((item, index) => <li key={`${item.title}-${index}`} className="relative min-h-12">
        <DesignIcon name={item.waiting ? "timeline-waiting" : "timeline-dot"} size={33} className="absolute -left-[40.5px] -top-[8.5px]" />
        <p className={cn("text-[14px] font-medium leading-5 tracking-[-0.015em]", item.waiting ? "text-[#808080]" : "text-[#111810]")}>{item.title}</p>
        <p className="mt-1 text-[14px] font-normal leading-6 tracking-[-0.018em] text-[#808080]">{item.waiting ? "Waiting" : item.date && `${new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${new Date(item.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}</p>
      </li>)}
    </ol>
  );
}
