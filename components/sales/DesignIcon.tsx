import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

// Original vector assets exported from the supplied FigCraft files.
export function DesignIcon({ name, size = 20, color, className, namespace = "sales" }: { name: string; size?: number; color?: string; className?: string; namespace?: "sales" | "categories" | "shipping" }) {
  const url = `/icons/${namespace}/${name}.svg`;
  const style: CSSProperties = color ? {
    width: size, height: size, backgroundColor: color,
    maskImage: `url(${url})`, WebkitMaskImage: `url(${url})`,
    maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
    maskPosition: "center", WebkitMaskPosition: "center",
    maskSize: "contain", WebkitMaskSize: "contain",
  } : { width: size, height: size };
  return color ? <span aria-hidden="true" className={cn("inline-block shrink-0 align-middle", className)} style={style} /> : <img src={url} alt="" aria-hidden="true" width={size} height={size} className={cn("inline-block shrink-0 align-middle", className)} style={style} />;
}
