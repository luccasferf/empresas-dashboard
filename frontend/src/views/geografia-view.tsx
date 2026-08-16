import { lazy, Suspense, useMemo, useState } from "react";
import { Map as MapIcon, List } from "lucide-react";
import { ViewHeader } from "@/components/layout/view-header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { RankingList } from "@/components/dashboard/ranking-list";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGeoMunicipios, useGeoUf } from "@/hooks/useApiQueries";
import { fmtInt, toTitleCase } from "@/lib/format";
import type { Filtros } from "@/types/api";

// react-simple-maps + d3-geo só entram no bundle quando a view Geografia é
// realmente visitada — a lib mais pesada do projeto.
const UfMap = lazy(() => import("@/components/dashboard/uf-map").then((m) => ({ default: m.UfMap })));
const MunicipioMap = lazy(() =>
  import("@/components/dashboard/municipio-map").then((m) => ({ default: m.MunicipioMap })),
);

export function GeografiaView({ filtros }: { filtros: Filtros }) {
  const [visualizacao, setVisualizacao] = useState<"mapa" | "lista">("mapa");
  const modoUf = filtros.uf === "Todos";

  const geoUf = useGeoUf(filtros, modoUf);
  const geoMun = useGeoMunicipios(filtros, !modoUf);

  const dados = modoUf ? geoUf.data : geoMun.data;
  const isLoading = modoUf ? geoUf.isLoading : geoMun.isLoading;
  const isEmpty = !isLoading && (!dados || dados.length === 0);

  const itensOrdenados = useMemo(() => {
    if (!dados) return [];
    if (modoUf) {
      return [...(dados as { uf: string; total: number }[])]
        .sort((a, b) => b.total - a.total)
        .map((d) => ({ nome: d.uf, valorFmt: fmtInt(d.total), valorNum: d.total }));
    }
    return [...(dados as { municipio: string; total: number }[])]
      .sort((a, b) => b.total - a.total)
      .map((d) => ({ nome: toTitleCase(d.municipio), valorFmt: fmtInt(d.total), valorNum: d.total }));
  }, [dados, modoUf]);

  return (
    <div className="flex h-full flex-col">
      <ViewHeader
        kicker="Distribuição espacial"
        title="Geografia"
        subtitle={modoUf ? "Empresas por estado" : `Empresas por município em ${filtros.uf}`}
        action={
          <ToggleGroup
            aria-label="Visualização"
            value={visualizacao}
            onValueChange={(v) => v && setVisualizacao(v as "mapa" | "lista")}
            className="w-auto"
          >
            <ToggleGroupItem value="mapa" className="flex items-center gap-1.5 px-4">
              <MapIcon className="size-3.5" /> Mapa
            </ToggleGroupItem>
            <ToggleGroupItem value="lista" className="flex items-center gap-1.5 px-4">
              <List className="size-3.5" /> Lista
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />

      {visualizacao === "lista" ? (
        <ChartCard isLoading={isLoading} isEmpty={isEmpty} className="min-h-0 flex-1" noPadding>
          <RankingList itens={itensOrdenados} fill />
        </ChartCard>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 gap-4 lg:grid-cols-[2.2fr_1fr]">
          <ChartCard isLoading={isLoading} isEmpty={isEmpty} className="flex min-h-0 items-center justify-center">
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              {dados &&
                dados.length > 0 &&
                (modoUf ? (
                  <UfMap dados={dados as { uf: string; total: number }[]} />
                ) : (
                  <MunicipioMap dados={dados as { municipio: string; total: number }[]} uf={filtros.uf} />
                ))}
            </Suspense>
          </ChartCard>
          <ChartCard isLoading={isLoading} isEmpty={isEmpty} className="min-h-0" noPadding>
            <RankingList itens={itensOrdenados} titulo={modoUf ? "Ranking por estado" : "Ranking por município"} fill />
          </ChartCard>
        </div>
      )}
    </div>
  );
}
