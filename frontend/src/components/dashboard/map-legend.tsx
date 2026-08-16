import { useTheme } from "@/lib/theme-provider";

export function MapLegend({ ticks, gradientId }: { ticks: string[]; gradientId: string }) {
  const { paleta } = useTheme();
  return (
    <div className="flex items-center gap-2">
      <svg width={90} height={10} className="rounded-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            {paleta.escalaSequencial.map(([t, cor]) => (
              <stop key={t} offset={`${t * 100}%`} stopColor={cor} />
            ))}
          </linearGradient>
        </defs>
        <rect width={90} height={10} rx={5} fill={`url(#${gradientId})`} />
      </svg>
      <div className="flex gap-2 text-[10.5px] text-text-secondary">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
