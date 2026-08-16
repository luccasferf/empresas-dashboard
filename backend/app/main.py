"""
API do DataNimbus — casca HTTP fina sobre o mesmo arquivo DuckDB que o app
Streamlit já usa (data/dados_locais.duckdb, gerado por sync.py). Não recalcula
nada que utils/queries.py não recalculasse: mesmas cláusulas WHERE, mesmas
métricas. O único trabalho novo aqui é parsear filtros da query string e
serializar o resultado como JSON.
"""
import os
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app import queries
from app.db import db_last_modified, get_connection
from app.queries import Filtros
from app.schemas import (
    DistPorteItem,
    DistSituacaoItem,
    FilterOptionsResponse,
    GeoMunicipioItem,
    GeoUfItem,
    KpisResponse,
    MetaResponse,
    RankingCnaeItem,
    SerieEvolucaoItem,
)

app = FastAPI(title="DataNimbus API", version="1.0.0")

_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def filtros_dep(
    uf: str = Query("Todos"),
    municipios: list[str] = Query(default=[]),
    cnaes: list[str] = Query(default=[]),
    portes: list[str] = Query(default=[]),
    situacoes: list[str] = Query(default=[]),
    ano_inicio: int = Query(2000),
    ano_fim: int = Query(2026),
) -> Filtros:
    return Filtros(
        uf=uf,
        municipios=tuple(municipios),
        cnaes=tuple(cnaes),
        portes=tuple(portes),
        situacoes=tuple(situacoes),
        ano_inicio=ano_inicio,
        ano_fim=ano_fim,
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/meta", response_model=MetaResponse)
def meta():
    con = get_connection()
    ano_min, ano_max = queries.get_ano_bounds(con)
    ultima = datetime.fromtimestamp(db_last_modified(), tz=timezone.utc).isoformat()
    return MetaResponse(
        total_registros=queries.get_total_registros(con),
        ano_min=ano_min,
        ano_max=ano_max,
        ultima_atualizacao=ultima,
    )


@app.get("/api/filter-options", response_model=FilterOptionsResponse)
def filter_options():
    con = get_connection()
    return FilterOptionsResponse(
        ufs=queries.get_uf_options(con),
        cnaes=queries.get_cnae_options(con),
        portes=queries.get_porte_options(con),
        situacoes=queries.get_situacao_options(con),
    )


@app.get("/api/filter-options/municipios", response_model=list[str])
def filter_options_municipios(uf: str):
    con = get_connection()
    return queries.get_municipio_options(con, uf)


@app.get("/api/kpis", response_model=KpisResponse)
def kpis(filtros: Filtros = Depends(filtros_dep)):
    con = get_connection()
    return KpisResponse(
        ativas=queries.kpi_ativas(con, filtros),
        mei=queries.kpi_mei(con, filtros),
        simples=queries.kpi_simples(con, filtros),
        aberturas=queries.kpi_aberturas_periodo(con, filtros),
        taxa_sobrevivencia=queries.kpi_taxa_ativas_baixadas(con, filtros),
    )


@app.get("/api/geo/uf", response_model=list[GeoUfItem])
def geo_uf(filtros: Filtros = Depends(filtros_dep)):
    con = get_connection()
    return queries.mapa_por_uf(con, filtros)


@app.get("/api/geo/municipios", response_model=list[GeoMunicipioItem])
def geo_municipios(filtros: Filtros = Depends(filtros_dep), limite: int = 1000):
    con = get_connection()
    return queries.ranking_municipios(con, filtros, limite=limite)


@app.get("/api/series/evolucao", response_model=list[SerieEvolucaoItem])
def series_evolucao(filtros: Filtros = Depends(filtros_dep)):
    con = get_connection()
    return queries.serie_evolucao_anual(con, filtros)


@app.get("/api/dist/porte", response_model=list[DistPorteItem])
def dist_porte(filtros: Filtros = Depends(filtros_dep)):
    con = get_connection()
    return queries.dist_porte(con, filtros)


@app.get("/api/dist/situacao", response_model=list[DistSituacaoItem])
def dist_situacao(filtros: Filtros = Depends(filtros_dep)):
    con = get_connection()
    return queries.dist_situacao(con, filtros)


@app.get("/api/ranking/cnae", response_model=list[RankingCnaeItem])
def ranking_cnae(filtros: Filtros = Depends(filtros_dep), limite: int = 15):
    con = get_connection()
    return queries.ranking_cnae(con, filtros, limite=limite)
