import type { ReactNode } from "react";

interface ChartTooltipProps {
  active?: boolean;
  children?: ReactNode;
}

/** Wrapper visual comum a todos os tooltips de gráfico (Recharts `content`). */
export function ChartTooltipShell({ active, children }: ChartTooltipProps) {
  if (!active || !children) return null;
  return (
    <div className="rounded-lg border border-border bg-page px-3 py-2 text-xs text-text-primary shadow-dn-md">
      {children}
    </div>
  );
}
