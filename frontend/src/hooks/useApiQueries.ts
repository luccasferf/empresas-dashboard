import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Filtros } from "@/types/api";

const STALE_TIME = 5 * 60 * 1000;

export function useMeta() {
  return useQuery({ queryKey: ["meta"], queryFn: api.meta, staleTime: STALE_TIME });
}

export function useFilterOptions() {
  return useQuery({ queryKey: ["filter-options"], queryFn: api.filterOptions, staleTime: STALE_TIME });
}

export function useMunicipioOptions(uf: string) {
  return useQuery({
    queryKey: ["municipio-options", uf],
    queryFn: () => api.municipioOptions(uf),
    enabled: uf !== "Todos",
    staleTime: STALE_TIME,
  });
}

export function useKpis(filtros: Filtros) {
  return useQuery({ queryKey: ["kpis", filtros], queryFn: () => api.kpis(filtros) });
}

export function useGeoUf(filtros: Filtros, enabled: boolean) {
  return useQuery({ queryKey: ["geo-uf", filtros], queryFn: () => api.geoUf(filtros), enabled });
}

export function useGeoMunicipios(filtros: Filtros, enabled: boolean) {
  return useQuery({
    queryKey: ["geo-municipios", filtros],
    queryFn: () => api.geoMunicipios(filtros, 1000),
    enabled,
  });
}

export function useSerieEvolucao(filtros: Filtros) {
  return useQuery({ queryKey: ["serie-evolucao", filtros], queryFn: () => api.serieEvolucao(filtros) });
}

export function useDistPorte(filtros: Filtros) {
  return useQuery({ queryKey: ["dist-porte", filtros], queryFn: () => api.distPorte(filtros) });
}

export function useDistSituacao(filtros: Filtros) {
  return useQuery({ queryKey: ["dist-situacao", filtros], queryFn: () => api.distSituacao(filtros) });
}

export function useRankingCnae(filtros: Filtros) {
  return useQuery({ queryKey: ["ranking-cnae", filtros], queryFn: () => api.rankingCnae(filtros, 15) });
}
