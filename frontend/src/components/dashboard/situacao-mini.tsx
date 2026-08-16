import { useMemo } from "react";
import { motion } from "motion/react";
import { useTheme } from "@/lib/theme-provider";
import { fmtPct } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import type { DistSituacaoItem } from "@/types/api";

/** Resumo compacto de situação cadastral pro Overview — uma barra empilhada
 * horizontal + chips com percentuais, pensado pra caber na altura de um
 * card de KPI (não é o pie chart completo, que fica na view "Empresas"). */
export function SituacaoMini({ dados, isLoading }: { dados: DistSituacaoItem[] | undefined; isLoading: boolean }) {
  const { paleta } = useTheme();

  const itens = useMemo(() => {
    if (!dados) return [];
    const total = dados.reduce((acc, d) => acc + d.total, 0);
    return [...dados]
      .sort((a, b) => b.total - a.total)
      .map((d) => ({ ...d, pct: total ? (d.total / total) * 100 : 0 }));
  }, [dados]);

  if (isLoading || !dados) {
    return <Skeleton className="h-full min-h-[70px] w-full rounded-lg" />;
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-pill bg-grid">
        {itens.map((item, i) => (
          <motion.div
            key={item.situacao_cadastral}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(item.pct, 1.5)}%` }}
            transition={{ duration: 0.5, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: paleta.corSituacao[item.situacao_cadastral] ?? paleta.textMuted }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {itens.map((item) => (
          <div key={item.situacao_cadastral} className="flex items-center gap-1.5 text-[12.5px]">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: paleta.corSituacao[item.situacao_cadastral] ?? paleta.textMuted }}
            />
            <span className="font-semibold text-text-primary">{item.situacao_cadastral}</span>
            <span className="font-bold tabular-nums text-text-secondary">{fmtPct(item.pct)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
