"use client";

import { cn } from "@/lib/utils";
import LoadingState from "@/components/LoadingState";

type LoadingOverlayProps = {
  message?: string;
  className?: string;
  panelClassName?: string;
};

const LoadingOverlay = ({
  message = "Loading...",
  className,
  panelClassName,
}: LoadingOverlayProps) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
        className
      )}
    >
      <div
        className={cn(
          "bg-white flex flex-col items-center justify-center w-[90%] max-w-[432px] min-h-[160px] rounded-lg shadow-lg",
          panelClassName
        )}
      >
        <LoadingState message={message} />
      </div>
    </div>
  );
};

export default LoadingOverlay;
