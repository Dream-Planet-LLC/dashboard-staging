"use client";

import { useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DesignIcon } from "./DesignIcon";
import { colorPalette } from "./colorPalette";
import { SalesSelect } from "./SalesSelect";
import { salesButton, salesOutlineButton } from "./SalesPrimitives";
import { cn } from "@/lib/utils";

const white = [254, 255, 254];
const interpolate = (start: number[], end: number[], position: number) => start.map((value, index) => value + (end[index] - value) * position);
function gradient(start: number[], end: number[], position: number) {
  return position < 0.489583 ? interpolate(start, white, position / 0.489583) : interpolate(white, end, (position - 0.489583) / (1 - 0.489583));
}
const toHex = (rgb: number[]) => "#" + rgb.map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("").toUpperCase();

export function ColorPicker({ onAdd, selected }: { onAdd: (color: string) => void; selected: string[] }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [customColors, setCustomColors] = useState(["#AF3FA0"]);
  const [hex, setHex] = useState("#5F3CFF");
  const [format, setFormat] = useState("hex");
  const [point, setPoint] = useState({ x: 33, y: 151 });
  const [saturation, setSaturation] = useState(57);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!custom || !open) return;
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    const bitmap = context.createImageData(296, 200);
    // The two original multiply gradients are cropped from 384px squares.
    for (let y = 0; y < 200; y++) {
      const vertical = gradient([255, 0, 0], [0, 255, 255], (92 + y) / 384);
      for (let x = 0; x < 296; x++) {
        const horizontal = gradient([125, 0, 255], [125, 255, 0], (44 + x) / 384);
        const offset = (y * 296 + x) * 4;
        for (let channel = 0; channel < 3; channel++) bitmap.data[offset + channel] = vertical[channel] * horizontal[channel] / 255;
        bitmap.data[offset + 3] = 255;
      }
    }
    context.putImageData(bitmap, 0, 0);
  }, [custom, open]);

  const sample = (x: number, y: number, nextSaturation = saturation) => {
    const position = { x: Math.max(0, Math.min(295, x)), y: Math.max(0, Math.min(199, y)) };
    setPoint(position);
    const rgb = canvas.current?.getContext("2d")?.getImageData(Math.round(position.x), Math.round(position.y), 1, 1).data;
    if (rgb) {
      const channels = Array.from(rgb).slice(0, 3);
      const gray = channels.reduce((sum, value) => sum + value, 0) / 3;
      setHex(toHex(channels.map((value) => gray + (value - gray) * nextSaturation / 57)));
    }
  };
  const add = (color: string) => { onAdd(color); setOpen(false); };
  const validHex = /^#[0-9A-F]{6}$/i.test(hex);
  const rgbText = validHex ? [1, 3, 5].map((position) => parseInt(hex.slice(position, position + 2), 16)).join(", ") : "";

  return (
    <Popover.Root open={open} onOpenChange={(value) => { setOpen(value); if (!value) setCustom(false); }}>
      <Popover.Trigger asChild><button type="button" aria-label="Add color" className="flex h-6 w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#808080]"><DesignIcon name="plus-circle" size={24} /></button></Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" side="bottom" sideOffset={8} collisionPadding={12} className={cn("INT400 z-50 rounded-lg bg-white text-[#808080] shadow-[0_1px_2px_#00000005] outline-none", custom ? "w-[328px] border border-[#E2E4E9]" : "w-[296px] p-4 ring-1 ring-[#E2E4E9]")}>
          {custom ? <>
            <div className="space-y-4 p-4">
              <div className="relative h-[200px] w-[296px] overflow-hidden rounded-[3px]">
                <canvas ref={canvas} width={296} height={200} aria-label="Choose custom color" role="slider" tabIndex={0} aria-valuetext={hex} aria-valuemin={0} aria-valuemax={295} aria-valuenow={Math.round(point.x)} className="h-full w-full touch-none cursor-crosshair outline-none"
                  onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); const rect = event.currentTarget.getBoundingClientRect(); sample(event.clientX - rect.left, event.clientY - rect.top); }}
                  onPointerMove={(event) => { if (event.buttons === 1) { const rect = event.currentTarget.getBoundingClientRect(); sample(event.clientX - rect.left, event.clientY - rect.top); } }}
                  onKeyDown={(event) => { const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key]; if (direction) { event.preventDefault(); sample(point.x + direction[0], point.y + direction[1]); } }} />
                <span className="pointer-events-none absolute h-5 w-5 rounded-full border-[3px] border-white shadow-sm" style={{ left: point.x - 10, top: point.y - 10 }} />
              </div>
              <input type="range" min={0} max={100} value={saturation} aria-label="Color saturation" onChange={(event) => { const value = Number(event.target.value); setSaturation(value); sample(point.x, point.y, value); }} className="sales-color-range block h-2.5 w-full cursor-pointer appearance-none rounded" />
              <div className="grid h-11 grid-cols-[144px_144px] gap-2 text-[14px]">
                <SalesSelect value={format} onChange={setFormat} label="Color format" compact className="h-11 text-[#808080]" options={[{ value: "hex", label: "Hex" }, { value: "rgb", label: "RGB" }]} />
                <div className="flex h-11 items-center rounded-lg border border-[#F1F1F1] px-2">
                  <input aria-label={format === "hex" ? "Hex color" : "RGB color"} value={format === "hex" ? hex : rgbText} className="w-full min-w-0 bg-transparent outline-none" onChange={(event) => {
                    if (format === "hex") setHex(event.target.value.toUpperCase());
                    else { const rgb = event.target.value.split(",").map(Number); if (rgb.length === 3 && rgb.every((value) => Number.isFinite(value) && value >= 0 && value <= 255)) setHex(toHex(rgb)); }
                  }} />
                  <DesignIcon name="chevron" size={16} />
                </div>
              </div>
            </div>
            <div className="flex h-[65px] items-center justify-between border-t border-[#E4E4E4] p-4">
              <button type="button" className={cn(salesOutlineButton, "h-8 rounded-lg")} onClick={() => setCustom(false)}>Cancel</button>
              <button type="button" disabled={!validHex} className={salesButton} onClick={() => { if (!validHex) return; setCustomColors((current) => Array.from(new Set([...current, hex]))); add(hex); }}>Done</button>
            </div>
          </> : <>
            <div className="grid grid-cols-9 gap-1.5">{colorPalette.flat().map((color) => <button type="button" key={color} aria-label={color} aria-pressed={selected.includes(color)} onClick={() => add(color)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#0000000D] outline-none focus-visible:ring-2 focus-visible:ring-[#808080] focus-visible:ring-offset-1" style={{ backgroundColor: color }}>{selected.includes(color) && <DesignIcon name="check" size={16} color={color === "#FFFFFF" ? "#111810" : "#FFFFFF"} />}</button>)}</div>
            <p className="mb-2 mt-4 text-[14px] font-bold leading-[17px] tracking-[2px]">CUSTOM</p>
            <div className="flex items-center gap-2"><button type="button" aria-label="Choose custom color" className="h-6 w-6 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#808080]" onClick={() => setCustom(true)}><DesignIcon name="plus-circle" size={24} /></button>{customColors.map((color) => <button type="button" key={color} aria-label={color} onClick={() => add(color)} className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />)}</div>
          </>}
        </Popover.Content>
      </Popover.Portal>
      <style jsx global>{`
        .sales-color-range { background: linear-gradient(90deg, #ffffff 0%, #5f3cff 100%); }
        .sales-color-range::-webkit-slider-runnable-track { height: 8px; border-radius: 2px; }
        .sales-color-range::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; margin-top: -3px; border-radius: 50%; border: 2px solid white; background: #111810; box-shadow: 0 0 0 1px #808080; }
        .sales-color-range::-moz-range-thumb { width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; background: #111810; }
      `}</style>
    </Popover.Root>
  );
}
