import { useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoMercator } from "d3-geo";
import { useTheme } from "@/lib/theme-provider";
import { useMunicipiosCrosswalk, useMunicipiosGeoJson } from "@/hooks/useGeoJson";
import { normalizarNome } from "@/lib/geo-constants";
import { interpolarSequencial, ticksEscalaLog } from "@/lib/scale";
import { fmtInt, fmtPct, toTitleCase } from "@/lib/format";
import { MapTooltip, type MapTooltipState } from "@/components/dashboard/map-tooltip";
import { MapLegend } from "@/components/dashboard/map-legend";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeoMunicipioItem } from "@/types/api";

const WIDTH = 760;
const HEIGHT = 480;

export function MunicipioMap({ dados, uf }: { dados: GeoMunicipioItem[]; uf: string }) {
  const { paleta } = useTheme();
  const { data: geojsonCompleto, isLoading: carregandoGeo } = useMunicipiosGeoJson(true);
  const { data: crosswalk, isLoading: carregandoCrosswalk } = useMunicipiosCrosswalk(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<MapTooltipState | null>(null);

  const totalUf = useMemo(() => dados.reduce((acc, d) => acc + d.total, 0), [dados]);

  const totalPorCodarea = useMemo(() => {
    if (!crosswalk) return new Map<string, { total: number; nome: string }>();
    const mapa = new Map<string, { total: number; nome: string }>();
    for (const d of dados) {
      const codarea = crosswalk[`${uf}|${normalizarNome(d.municipio)}`];
      if (codarea) mapa.set(codarea, { total: d.total, nome: d.municipio });
    }
    return mapa;
  }, [dados, crosswalk, uf]);

  const totais = useMemo(() => [...totalPorCodarea.values()].map((v) => v.total), [totalPorCodarea]);
  const minValor = totais.length ? Math.min(...totais) : 0;
  const maxValor = totais.length ? Math.max(...totais) : 1;
  const logMin = Math.log10(Math.max(minValor, 1));
  const logMax = Math.log10(Math.max(maxValor, 1));
  const { textos: ticksTexto } = useMemo(() => ticksEscalaLog(minValor, maxValor), [minValor, maxValor]);

  const featuresUf = useMemo(
    () => (geojsonCompleto ? geojsonCompleto.features.filter((f: any) => f.properties?.sigla_uf === uf) : []),
    [geojsonCompleto, uf],
  );
  const geojsonUf = useMemo(() => ({ type: "FeatureCollection", features: featuresUf }), [featuresUf]);

  // Ver comentário equivalente em uf-map.tsx: react-simple-maps espera o
  // objeto de projeção já construído (chamável, como todo d3 projection),
  // não uma factory (width, height) => projeção.
  const projection = useMemo(() => {
    if (!featuresUf.length) return undefined;
    return geoMercator().fitSize([WIDTH, HEIGHT], geojsonUf as any);
  }, [featuresUf.length, geojsonUf]);

  function handleMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover((h) => (h ? { ...h, x: e.clientX - rect.left, y: e.clientY - rect.top } : h));
  }

  if (carregandoGeo || carregandoCrosswalk || !projection) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <ComposableMap projection={projection as never} width={WIDTH} height={HEIGHT} className="h-auto w-full">
        <Geographies geography={geojsonUf}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const info = totalPorCodarea.get(String(geo.properties.codarea));
              const semDado = !info;
              const t = semDado ? 0 : (Math.log10(Math.max(info!.total, 1)) - logMin) / (logMax - logMin || 1);
              const fill = semDado ? paleta.grid : interpolarSequencial(paleta.escalaSequencial, t);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  fillOpacity={semDado ? 0.35 : 1}
                  stroke={paleta.page}
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none", transition: "opacity 150ms ease" },
                    hover: { outline: "none", opacity: semDado ? 0.35 : 0.82, cursor: semDado ? "default" : "pointer" },
                    pressed: { outline: "none" },
                  }}
                  onMouseEnter={() => {
                    if (semDado) return;
                    const pct = totalUf ? fmtPct((info!.total / totalUf) * 100) : "0,0%";
                    setHover({
                      x: 0,
                      y: 0,
                      title: toTitleCase(info!.nome),
                      lines: [`${fmtInt(info!.total)} empresas`, `${pct} do estado`],
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
        <MapLegend ticks={ticksTexto} gradientId="legend-municipio" />
      </div>
    </div>
  );
}
