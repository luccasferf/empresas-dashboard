import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

type ToggleGroupProps = Omit<ToggleGroupPrimitive.ToggleGroupSingleProps, "type">;

export function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      className={cn("flex w-full rounded-full border border-border bg-surface p-1", className)}
      {...props}
    />
  );
}

export function ToggleGroupItem({
  className,
  ...props
}: ToggleGroupPrimitive.ToggleGroupItemProps) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        "flex-1 rounded-full px-3 py-1.5 text-sm font-semibold text-text-secondary transition-colors duration-150",
        "hover:text-accent data-[state=on]:bg-accent data-[state=on]:text-page",
        className,
      )}
      {...props}
    />
  );
}
