/** Espelham os modelos Pydantic em backend/app/schemas.py. */

export interface Filtros {
  uf: string;
  municipios: string[];
  cnaes: string[];
  portes: string[];
  situacoes: string[];
  anoInicio: number;
  anoFim: number;
}

export const FILTROS_VAZIOS: Filtros = {
  uf: "Todos",
  municipios: [],
  cnaes: [],
  portes: [],
  situacoes: [],
  anoInicio: 2000,
  anoFim: 2026,
};

export interface MetaResponse {
  total_registros: number;
  ano_min: number;
  ano_max: number;
  ultima_atualizacao: string;
}

export interface FilterOptionsResponse {
  ufs: string[];
  cnaes: string[];
  portes: string[];
  situacoes: string[];
}

export interface KpisResponse {
  ativas: number;
  mei: number;
  simples: number;
  aberturas: number;
  taxa_sobrevivencia: number;
}

export interface GeoUfItem {
  uf: string;
  total: number;
}

export interface GeoMunicipioItem {
  municipio: string;
  total: number;
}

export interface SerieEvolucaoItem {
  ano_abertura: number;
  total: number;
}

export interface DistPorteItem {
  porte: string;
  total: number;
}

export interface DistSituacaoItem {
  situacao_cadastral: string;
  total: number;
}

export interface RankingCnaeItem {
  codigo_cnae: string;
  descricao_cnae: string;
  total: number;
}
