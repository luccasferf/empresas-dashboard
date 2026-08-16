interface MapTooltipState {
  x: number;
  y: number;
  title: string;
  lines: string[];
}

export function MapTooltip({ hover }: { hover: MapTooltipState | null }) {
  if (!hover) return null;
  return (
    <div
      className="pointer-events-none absolute z-10 max-w-[220px] -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border border-border bg-page px-3 py-2 text-xs text-text-primary shadow-dn-md"
      style={{ left: hover.x, top: hover.y }}
    >
      <p className="font-bold">{hover.title}</p>
      {hover.lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  );
}

export type { MapTooltipState };
