import type {
  DistPorteItem,
  DistSituacaoItem,
  Filtros,
  FilterOptionsResponse,
  GeoMunicipioItem,
  GeoUfItem,
  KpisResponse,
  MetaResponse,
  RankingCnaeItem,
  SerieEvolucaoItem,
} from "@/types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

function filtrosParams(filtros: Filtros, extra?: Record<string, string | number>): URLSearchParams {
  const params = new URLSearchParams();
  params.set("uf", filtros.uf);
  filtros.municipios.forEach((m) => params.append("municipios", m));
  filtros.cnaes.forEach((c) => params.append("cnaes", c));
  filtros.portes.forEach((p) => params.append("portes", p));
  filtros.situacoes.forEach((s) => params.append("situacoes", s));
  params.set("ano_inicio", String(filtros.anoInicio));
  params.set("ano_fim", String(filtros.anoFim));
  if (extra) {
    for (const [k, v] of Object.entries(extra)) params.set(k, String(v));
  }
  return params;
}

async function getJSON<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = `${BASE_URL}${path}${params ? `?${params.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao buscar ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  meta: () => getJSON<MetaResponse>("/api/meta"),
  filterOptions: () => getJSON<FilterOptionsResponse>("/api/filter-options"),
  municipioOptions: (uf: string) =>
    getJSON<string[]>("/api/filter-options/municipios", new URLSearchParams({ uf })),
  kpis: (filtros: Filtros) => getJSON<KpisResponse>("/api/kpis", filtrosParams(filtros)),
  geoUf: (filtros: Filtros) => getJSON<GeoUfItem[]>("/api/geo/uf", filtrosParams(filtros)),
  geoMunicipios: (filtros: Filtros, limite = 1000) =>
    getJSON<GeoMunicipioItem[]>("/api/geo/municipios", filtrosParams(filtros, { limite })),
  serieEvolucao: (filtros: Filtros) =>
    getJSON<SerieEvolucaoItem[]>("/api/series/evolucao", filtrosParams(filtros)),
  distPorte: (filtros: Filtros) => getJSON<DistPorteItem[]>("/api/dist/porte", filtrosParams(filtros)),
  distSituacao: (filtros: Filtros) =>
    getJSON<DistSituacaoItem[]>("/api/dist/situacao", filtrosParams(filtros)),
  rankingCnae: (filtros: Filtros, limite = 15) =>
    getJSON<RankingCnaeItem[]>("/api/ranking/cnae", filtrosParams(filtros, { limite })),
};
