import type { ReactNode } from "react";

export interface StatInlineItem {
  label: string;
  value: string;
  tone?: "good" | "critical" | "neutral";
  icon?: ReactNode;
}

const TONE_CLASS: Record<NonNullable<StatInlineItem["tone"]>, string> = {
  good: "text-status-good",
  critical: "text-status-critical",
  neutral: "text-text-primary",
};

/** Faixa de métricas derivadas pequenas — usada como complemento a um gráfico
 * grande (Evolução, Empresas), nunca como substituto de um KPI principal. */
export function StatInlineRow({ items }: { items: StatInlineItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-card border border-border bg-surface px-5 py-3.5 shadow-dn-sm">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.icon}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{item.label}</p>
            <p className={`text-[15px] font-bold tabular-nums ${TONE_CLASS[item.tone ?? "neutral"]}`}>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
