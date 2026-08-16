import { useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoMercator } from "d3-geo";
import type { GeoJsonObject } from "geojson";
import { useTheme } from "@/lib/theme-provider";
import { useUfGeoJson } from "@/hooks/useGeoJson";
import { NOME_POR_SIGLA_UF, SIGLA_POR_CODIGO_IBGE } from "@/lib/geo-constants";
import { eixoValoresPtBr, interpolarSequencial } from "@/lib/scale";
import { fmtInt, fmtPct } from "@/lib/format";
import { MapTooltip, type MapTooltipState } from "@/components/dashboard/map-tooltip";
import { MapLegend } from "@/components/dashboard/map-legend";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeoUfItem } from "@/types/api";

const WIDTH = 760;
const HEIGHT = 460;

export function UfMap({ dados }: { dados: GeoUfItem[] }) {
  const { paleta } = useTheme();
  const { data: geojson, isLoading } = useUfGeoJson();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<MapTooltipState | null>(null);

  const totalPorSigla = useMemo(() => new Map(dados.map((d) => [d.uf, d.total])), [dados]);
  const totalGeral = useMemo(() => dados.reduce((acc, d) => acc + d.total, 0), [dados]);
  const maxValor = useMemo(() => Math.max(...dados.map((d) => d.total), 1), [dados]);
  const { textos: ticksTexto } = useMemo(() => eixoValoresPtBr(maxValor, 4), [maxValor]);

  // react-simple-maps espera literalmente um objeto de projeção d3 aqui (que
  // por convenção do d3 É uma função, com métodos como .stream anexados) —
  // não uma factory (width, height) => projeção. fitSize já embute o
  // enquadramento equivalente ao fitbounds="locations" do Plotly original.
  const projection = useMemo(() => {
    if (!geojson) return undefined;
    return geoMercator().fitSize([WIDTH, HEIGHT], geojson as GeoJsonObject as any);
  }, [geojson]);

  function handleMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover((h) => (h ? { ...h, x: e.clientX - rect.left, y: e.clientY - rect.top } : h));
  }

  if (isLoading || !geojson || !projection) {
    return <Skeleton className="h-[460px] w-full" />;
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <ComposableMap projection={projection as never} width={WIDTH} height={HEIGHT} className="h-auto w-full">
        <Geographies geography={geojson}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const sigla = SIGLA_POR_CODIGO_IBGE[String(geo.properties.codarea)];
              const total = totalPorSigla.get(sigla) ?? 0;
              const fill = interpolarSequencial(paleta.escalaSequencial, total / maxValor);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={paleta.page}
                  strokeWidth={0.8}
                  style={{
                    default: { outline: "none", transition: "opacity 150ms ease" },
                    hover: { outline: "none", opacity: 0.82, cursor: "pointer" },
                    pressed: { outline: "none" },
                  }}
                  onMouseEnter={() => {
                    const pct = totalGeral ? fmtPct((total / totalGeral) * 100) : "0,0%";
                    setHover({
                      x: 0,
                      y: 0,
                      title: NOME_POR_SIGLA_UF[sigla] ?? sigla,
                      lines: [`${fmtInt(total)} empresas`, `${pct} do total filtrado`],
                    });
                  }}
                  onMouseMove={handleMove}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <MapTooltip hover={hover} />
      <div className="absolute bottom-2 left-2">
        <MapLegend ticks={ticksTexto} gradientId="legend-uf" />
      </div>
    </div>
  );
}
