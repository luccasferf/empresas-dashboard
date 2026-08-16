import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Slider({ className, ...props }: SliderPrimitive.SliderProps) {
  const thumbCount = (props.value ?? props.defaultValue ?? [0]).length;
  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-pill bg-grid">
        <SliderPrimitive.Range className="absolute h-full bg-accent" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-4 w-4 rounded-full bg-accent shadow-dn-sm transition-shadow hover:shadow-[0_0_0_6px_var(--dn-accent-glow)] focus-visible:outline-none focus-visible:shadow-[0_0_0_6px_var(--dn-accent-glow)]"
        />
      ))}
    </SliderPrimitive.Root>
  );
}
