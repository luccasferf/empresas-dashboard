import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs rounded-lg border border-border bg-page px-3 py-2 text-xs text-text-primary shadow-dn-md",
          "origin-[var(--radix-tooltip-content-transform-origin)] transition-[opacity,transform] duration-150 data-[state=instant-open]:opacity-100 data-[state=delayed-open]:opacity-100",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
