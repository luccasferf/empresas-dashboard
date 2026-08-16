import { lazy, Suspense } from "react";
import { ViewHeader } from "@/components/layout/view-header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRankingCnae } from "@/hooks/useApiQueries";
import type { Filtros } from "@/types/api";

const CnaeRanking = lazy(() =>
  import("@/components/dashboard/cnae-ranking").then((m) => ({ default: m.CnaeRanking })),
);

export function CnaeView({ filtros }: { filtros: Filtros }) {
  const { data: rankingCnae, isLoading: cnaeLoading } = useRankingCnae(filtros);

  return (
    <div className="flex h-full flex-col">
      <ViewHeader kicker="Setores de atividade" title="CNAE" subtitle="Top 15 setores de atividade" />

      <ChartCard
        isLoading={cnaeLoading}
        isEmpty={!cnaeLoading && rankingCnae?.length === 0}
        className="min-h-0 flex-1"
      >
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
          {rankingCnae && <CnaeRanking dados={rankingCnae} height="100%" />}
        </Suspense>
      </ChartCard>
    </div>
  );
}
