import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border border-border bg-page px-3 py-1 text-[11.5px] font-semibold text-text-muted",
        className,
      )}
      {...props}
    />
  );
}
