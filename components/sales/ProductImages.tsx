"use client";

import { useRef, useState } from "react";
import { ListingMedia } from "@/types/listings";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DesignIcon } from "./DesignIcon";
import { MediaPreview, salesOutlineButton, salesPanel } from "./SalesPrimitives";
import { cn } from "@/lib/utils";

export function ProductImages({ media, onChange, onError, uploading, onUploadingChange }: { media: ListingMedia[]; onChange: (media: ListingMedia[]) => void; onError: (message: string) => void; uploading: boolean; onUploadingChange: (value: boolean) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const upload = async (files: FileList | File[]) => {
    onError("");
    const items = Array.from(files);
    if (media.length + items.length > 6) { onError("You can upload up to 6 files."); return; }
    if (items.some((file) => !["image/jpeg", "image/png", "application/pdf", "video/mp4"].includes(file.type))) { onError("Choose a JPEG, PNG, PDF, or MP4 file."); return; }
    if (items.some((file) => file.size > 50 * 1024 * 1024)) { onError("Each file must be 50 MB or smaller."); return; }
    onUploadingChange(true);
    try {
      const uploaded = await Promise.all(items.map((file) => new Promise<ListingMedia>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: String(reader.result), name: file.name, type: file.type });
        reader.onerror = () => reject(new Error("Unable to read file"));
        reader.readAsDataURL(file);
      })));
      onChange([...media, ...uploaded]);
    } catch { onError("The file could not be uploaded. Please try again."); }
    finally { onUploadingChange(false); if (fileInput.current) fileInput.current.value = ""; }
  };

  return (
    <section className={cn(salesPanel, "overflow-hidden py-6")} aria-labelledby="images-heading">
      <h2 id="images-heading" className="mb-3 font-medium text-black">Product images</h2>
      <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (!uploading) void upload(event.dataTransfer.files); }} className={cn("flex h-[212px] flex-col items-center justify-center gap-5 rounded-lg border border-dashed px-6 py-8 text-center", dragging ? "border-[#F75803] bg-[#FFEEE6]" : "border-[#E2E4E9] bg-[#F7F7F7]")}>
        <DesignIcon name="upload" size={20} />
        <div><p className="font-medium">Choose a file or drag &amp; drop it here.</p><p className="mt-1 text-[12px] leading-4 text-[#808080]">JPEG, PNG, PDF, and MP4 formats, up to 50 MB.</p></div>
        <button disabled={uploading} type="button" onClick={() => fileInput.current?.click()} className={cn(salesOutlineButton, "w-24 whitespace-nowrap font-medium")}>{uploading ? "Uploading..." : "Browse file"}</button>
        <input ref={fileInput} type="file" multiple accept="image/jpeg,image/png,application/pdf,video/mp4" className="hidden" aria-label="Upload product images" onChange={(event) => { if (event.target.files) void upload(event.target.files); }} />
      </div>
      {media.length > 0 && <div className="-mr-4 mt-3 overflow-x-auto pb-0 scrollbar-hide">
        <div className="flex w-max gap-2">{media.map((item, index) => <div key={`${item.name}-${index}`} className="relative h-[102px] w-[102px] shrink-0 overflow-hidden rounded-sm">
          <MediaPreview media={item} label={item.name} className="h-full w-full rounded-none" />
          {index === 0 && <span className="absolute inset-x-0 bottom-0 flex h-5 items-center justify-center bg-[#7E2D02] text-[12px] leading-4 text-[#FFEEE6]">Primary</span>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button type="button" aria-label={`Image actions for ${item.name}`} className="absolute right-1 top-1 h-4 w-4 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#F75803]"><DesignIcon name="more-circle" size={16} /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="INT400 w-[172px] space-y-2 rounded-[5px] border-[#F1F1F1] bg-white px-2 py-3 shadow-[0_1px_2px_#122B6914]">
              <DropdownMenuItem className="h-9 gap-3 px-2 py-2 font-medium text-[#373737] focus:bg-[#F7F7F7] focus:text-[#373737]" onSelect={() => onChange([media[index], ...media.filter((_, position) => position !== index)])}><DesignIcon name="star" size={20} />Make primary</DropdownMenuItem>
              <DropdownMenuItem className="h-9 gap-3 px-2 py-2 font-medium text-[#C83532] focus:bg-[#F7F7F7] focus:text-[#C83532]" onSelect={() => onChange(media.filter((_, position) => position !== index))}><DesignIcon name="trash-red" size={20} />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>)}</div>
      </div>}
    </section>
  );
}
