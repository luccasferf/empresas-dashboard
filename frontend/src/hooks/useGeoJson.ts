import { useQuery } from "@tanstack/react-query";

/**
 * Malhas geográficas (data/br_uf.geojson, br_municipios.geojson do repo,
 * copiadas pra frontend/public/geo/) — estáticas, baixadas uma vez da API do
 * IBGE, nunca mudam em runtime. `br_municipios.geojson` (6,3MB) só é buscado
 * quando alguém realmente entra num estado (ver GeoSection) — lazy por
 * natureza da árvore de componentes, não precisa de import() dinâmico.
 */
export function useUfGeoJson() {
  return useQuery({
    queryKey: ["geojson-uf"],
    queryFn: () => fetch("/geo/br_uf.geojson").then((r) => r.json()),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useMunicipiosGeoJson(enabled: boolean) {
  return useQuery({
    queryKey: ["geojson-municipios"],
    queryFn: () => fetch("/geo/br_municipios.geojson").then((r) => r.json()),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled,
  });
}

export function useMunicipiosCrosswalk(enabled: boolean) {
  return useQuery({
    queryKey: ["municipios-crosswalk"],
    queryFn: () => fetch("/geo/municipios_crosswalk.json").then((r) => r.json()) as Promise<Record<string, string>>,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled,
  });
}
