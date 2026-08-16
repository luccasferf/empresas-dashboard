import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Building2, Receipt, ShieldCheck, TrendingUp, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { fmtInt, fmtPct } from "@/lib/format";

export interface KpiItem {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "good" | "critical";
  tooltip?: string;
}

export function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  const valueColor = item.tone === "good" ? "text-status-good" : item.tone === "critical" ? "text-status-critical" : "text-text-primary";
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.04 + index * 0.05 }}
      whileHover={{ y: -3 }}
      className="rounded-card border-t-4 border-t-accent bg-surface p-4.5 shadow-dn-sm transition-shadow duration-200 hover:shadow-[0_0_0_1px_var(--dn-accent-glow),var(--shadow-dn-md)]"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
        {item.icon}
        {item.label}
      </div>
      <div className={`text-[1.6rem] font-bold tabular-nums ${valueColor}`}>{item.value}</div>
    </motion.div>
  );

  if (!item.tooltip) return card;
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent>{item.tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function KpiRow({
  ativas,
  mei,
  simples,
  aberturas,
  taxa,
  isLoading,
}: {
  ativas: number | undefined;
  mei: number | undefined;
  simples: number | undefined;
  aberturas: number | undefined;
  taxa: number | undefined;
  isLoading: boolean;
}) {
  if (isLoading || ativas === undefined) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-card" />
        ))}
      </div>
    );
  }

  const items: KpiItem[] = [
    { icon: <Building2 className="size-3.5" />, label: "Empresas ativas", value: fmtInt(ativas) },
    { icon: <User className="size-3.5" />, label: "MEIs ativos", value: fmtInt(mei) },
    { icon: <Receipt className="size-3.5" />, label: "Empresas no Simples Nacional", value: fmtInt(simples) },
    { icon: <TrendingUp className="size-3.5" />, label: "Aberturas no período", value: fmtInt(aberturas) },
    {
      icon: <ShieldCheck className="size-3.5" />,
      label: "Taxa de sobrevivência",
      value: fmtPct(taxa),
      tone: (taxa ?? 0) >= 50 ? "good" : "critical",
      tooltip: "Empresas ativas ÷ (ativas + baixadas) no período e recorte selecionados",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {items.map((item, i) => (
        <KpiCard key={item.label} item={item} index={i} />
      ))}
    </div>
  );
}
