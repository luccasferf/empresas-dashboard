import { lazy, Suspense, useMemo } from "react";
import { CalendarClock, TrendingDown, TrendingUp } from "lucide-react";
import { ViewHeader } from "@/components/layout/view-header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { StatInlineRow, type StatInlineItem } from "@/components/dashboard/stat-inline";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeta, useSerieEvolucao } from "@/hooks/useApiQueries";
import { fmtInt, fmtPct } from "@/lib/format";
import type { Filtros } from "@/types/api";

const EvolutionChart = lazy(() =>
  import("@/components/dashboard/evolution-chart").then((m) => ({ default: m.EvolutionChart })),
);

export function EvolucaoView({ filtros }: { filtros: Filtros }) {
  const { data: meta } = useMeta();
  const { data: evolucao, isLoading: evolucaoLoading } = useSerieEvolucao(filtros);
  const anoMaxGlobal = meta?.ano_max ?? filtros.anoFim;

  const stats = useMemo<StatInlineItem[]>(() => {
    if (!evolucao || evolucao.length === 0) return [];

    const temParcial = evolucao.length > 1 && evolucao[evolucao.length - 1].ano_abertura === anoMaxGlobal;
    const completos = temParcial ? evolucao.slice(0, -1) : evolucao;

    const items: StatInlineItem[] = [];

    if (completos.length > 0) {
      const maior = completos.reduce((a, b) => (b.total > a.total ? b : a));
      items.push({ label: "Ano com mais aberturas", value: `${maior.ano_abertura} · ${fmtInt(maior.total)}` });
    }

    if (completos.length >= 2) {
      const ultimo = completos[completos.length - 1];
      const anterior = completos[completos.length - 2];
      const variacao = anterior.total ? ((ultimo.total - anterior.total) / anterior.total) * 100 : 0;
      items.push({
        label: `Variação ${anterior.ano_abertura} → ${ultimo.ano_abertura}`,
        value: `${variacao >= 0 ? "+" : ""}${fmtPct(variacao)}`,
        tone: variacao >= 0 ? "good" : "critical",
        icon:
          variacao >= 0 ? (
            <TrendingUp className="size-4 text-status-good" />
          ) : (
            <TrendingDown className="size-4 text-status-critical" />
          ),
      });
    }

    if (temParcial) {
      items.push({
        label: "Observação",
        value: `${anoMaxGlobal} é um ano parcial`,
        icon: <CalendarClock className="size-4 text-text-muted" />,
      });
    }

    return items;
  }, [evolucao, anoMaxGlobal]);

  return (
    <div className="flex h-full flex-col">
      <ViewHeader kicker="Série histórica" title="Evolução" subtitle="Aberturas de empresas por ano" />

      <ChartCard
        isLoading={evolucaoLoading}
        isEmpty={!evolucaoLoading && evolucao?.length === 0}
        className="min-h-0 flex-1"
      >
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
          {evolucao && meta && <EvolutionChart dados={evolucao} anoMaxGlobal={meta.ano_max} height="100%" />}
        </Suspense>
      </ChartCard>

      {stats.length > 0 && (
        <div className="mt-4 shrink-0">
          <StatInlineRow items={stats} />
        </div>
      )}
    </div>
  );
}
