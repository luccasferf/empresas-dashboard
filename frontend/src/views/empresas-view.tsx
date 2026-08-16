import { lazy, Suspense, useMemo } from "react";
import { ViewHeader } from "@/components/layout/view-header";
import { SectionHeader } from "@/components/layout/section-header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { StatInlineRow, type StatInlineItem } from "@/components/dashboard/stat-inline";
import { Skeleton } from "@/components/ui/skeleton";
import { useDistPorte, useDistSituacao } from "@/hooks/useApiQueries";
import { fmtInt, fmtPct } from "@/lib/format";
import type { Filtros } from "@/types/api";

const PorteChart = lazy(() => import("@/components/dashboard/porte-chart").then((m) => ({ default: m.PorteChart })));
const SituacaoChart = lazy(() =>
  import("@/components/dashboard/situacao-chart").then((m) => ({ default: m.SituacaoChart })),
);

export function EmpresasView({ filtros }: { filtros: Filtros }) {
  const { data: distPorte, isLoading: porteLoading } = useDistPorte(filtros);
  const { data: distSituacao, isLoading: situacaoLoading } = useDistSituacao(filtros);

  const stats = useMemo<StatInlineItem[]>(() => {
    const items: StatInlineItem[] = [];

    if (distPorte && distPorte.length > 0) {
      const total = distPorte.reduce((acc, d) => acc + d.total, 0);
      const maior = distPorte.reduce((a, b) => (b.total > a.total ? b : a));
      items.push({
        label: "Porte predominante",
        value: `${maior.porte} · ${fmtPct(total ? (maior.total / total) * 100 : 0)}`,
      });
    }

    if (distSituacao && distSituacao.length > 0) {
      const total = distSituacao.reduce((acc, d) => acc + d.total, 0);
      const maior = distSituacao.reduce((a, b) => (b.total > a.total ? b : a));
      items.push({
        label: "Situação predominante",
        value: `${maior.situacao_cadastral} · ${fmtPct(total ? (maior.total / total) * 100 : 0)}`,
      });
      items.push({ label: "Total no recorte", value: fmtInt(total) });
    }

    return items;
  }, [distPorte, distSituacao]);

  return (
    <div className="flex h-full flex-col">
      <ViewHeader kicker="Perfil do cadastro" title="Empresas" subtitle="Distribuição por porte e situação cadastral" />

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col">
          <SectionHeader title="Distribuição por porte" />
          <ChartCard isLoading={porteLoading} isEmpty={!porteLoading && distPorte?.length === 0} className="min-h-0 flex-1">
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              {distPorte && <PorteChart dados={distPorte} height="100%" />}
            </Suspense>
          </ChartCard>
        </div>
        <div className="flex min-h-0 flex-col">
          <SectionHeader title="Situação cadastral" />
          <ChartCard
            isLoading={situacaoLoading}
            isEmpty={!situacaoLoading && distSituacao?.length === 0}
            className="min-h-0 flex-1"
          >
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              {distSituacao && <SituacaoChart dados={distSituacao} height="100%" />}
            </Suspense>
          </ChartCard>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="mt-4 shrink-0">
          <StatInlineRow items={stats} />
        </div>
      )}
    </div>
  );
}
