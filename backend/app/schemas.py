"""Modelos de resposta da API — tipam o que o frontend recebe."""
from pydantic import BaseModel


class MetaResponse(BaseModel):
    total_registros: int
    ano_min: int
    ano_max: int
    ultima_atualizacao: str  # ISO 8601, derivado do mtime real do .duckdb


class FilterOptionsResponse(BaseModel):
    ufs: list[str]
    cnaes: list[str]
    portes: list[str]
    situacoes: list[str]


class KpisResponse(BaseModel):
    ativas: int
    mei: int
    simples: int
    aberturas: int
    taxa_sobrevivencia: float


class GeoUfItem(BaseModel):
    uf: str
    total: int


class GeoMunicipioItem(BaseModel):
    municipio: str
    total: int


class SerieEvolucaoItem(BaseModel):
    ano_abertura: int
    total: int


class DistPorteItem(BaseModel):
    porte: str
    total: int


class DistSituacaoItem(BaseModel):
    situacao_cadastral: str
    total: int


class RankingCnaeItem(BaseModel):
    codigo_cnae: str
    descricao_cnae: str
    total: int
