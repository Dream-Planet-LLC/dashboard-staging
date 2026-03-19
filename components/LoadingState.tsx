"use client";

import { cn } from "@/lib/utils";

type LoadingStateProps = {
  message?: string;
  className?: string;
};

const LoadingState = ({
  message = "Loading...",
  className,
}: LoadingStateProps) => {
  return (
    <div className={cn("text-center space-y-4", className)}>
      <div className="animate-spin h-8 w-8 border-4 border-[#F75803] border-t-transparent rounded-full mx-auto" />
      <p className="text-[#808080]">{message}</p>
    </div>
  );
};

export default LoadingState;
