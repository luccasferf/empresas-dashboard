"""
Queries agregadas sobre a tabela local `empresas` — portadas 1:1 de
utils/queries.py (o módulo usado pelo app Streamlit). Mesmas regras de
negócio, mesmo SQL, mesmos filtros. Única diferença: aqui não há decorator
`st.cache_data` (o cache fica em cache.py) e o retorno é lista de dict em vez
de DataFrame, pra não precisar de pandas nesta API.

Qualquer mudança de regra de negócio (quais situações contam como válidas,
como se calcula a taxa de sobrevivência, etc.) deve ser espelhada dos dois
lados — ou melhor, feita só aqui e replicada lá, pra não divergir.
"""
from dataclasses import dataclass, field
from typing import Optional

import duckdb

from app.cache import cached

BASE_WHERE = "codigo_situacao_cadastral IN ('01','02','03','04','08') AND uf NOT IN ('EX','NA')"
PORTE_VALIDO = "porte_empresa_descricao IS NOT NULL AND porte_empresa_descricao != 'DESCONHECIDO'"


@dataclass(frozen=True)
class Filtros:
    uf: str = "Todos"
    municipios: tuple = field(default_factory=tuple)
    cnaes: tuple = field(default_factory=tuple)
    portes: tuple = field(default_factory=tuple)
    situacoes: tuple = field(default_factory=tuple)
    ano_inicio: int = 2000
    ano_fim: int = 2026


def _build_where(filtros: Filtros, exclude: frozenset = frozenset()):
    clauses = [BASE_WHERE]
    params = []

    if filtros.uf != "Todos" and "uf" not in exclude:
        clauses.append("uf = ?")
        params.append(filtros.uf)

    if filtros.municipios and "municipio" not in exclude:
        placeholders = ",".join("?" for _ in filtros.municipios)
        clauses.append(f"municipio IN ({placeholders})")
        params.extend(filtros.municipios)

    if filtros.cnaes and "cnae" not in exclude:
        placeholders = ",".join("?" for _ in filtros.cnaes)
        clauses.append(f"descricao_cnae IN ({placeholders})")
        params.extend(filtros.cnaes)

    if filtros.portes and "porte" not in exclude:
        placeholders = ",".join("?" for _ in filtros.portes)
        clauses.append(f"porte_empresa_descricao IN ({placeholders})")
        params.extend(filtros.portes)

    if filtros.situacoes and "situacao" not in exclude:
        placeholders = ",".join("?" for _ in filtros.situacoes)
        clauses.append(f"situacao_cadastral IN ({placeholders})")
        params.extend(filtros.situacoes)

    if "ano" not in exclude:
        clauses.append("ano_abertura BETWEEN ? AND ?")
        params.extend([filtros.ano_inicio, filtros.ano_fim])

    return " AND ".join(clauses), params


def _rows(con: duckdb.DuckDBPyConnection, sql: str, params: list) -> list[dict]:
    cursor = con.execute(sql, params)
    cols = [c[0] for c in cursor.description]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]


# ---------------------------------------------------------------------------
# Opções de filtro
# ---------------------------------------------------------------------------

@cached
def get_uf_options(con) -> list[str]:
    sql = f"SELECT DISTINCT uf FROM empresas WHERE {BASE_WHERE} ORDER BY uf"
    return [r[0] for r in con.execute(sql).fetchall()]


@cached
def get_municipio_options(con, uf: str) -> list[str]:
    if uf == "Todos":
        return []
    sql = f"SELECT DISTINCT municipio FROM empresas WHERE {BASE_WHERE} AND uf = ? ORDER BY municipio"
    return [r[0] for r in con.execute(sql, [uf]).fetchall()]


@cached
def get_cnae_options(con) -> list[str]:
    sql = (
        f"SELECT DISTINCT descricao_cnae FROM empresas WHERE {BASE_WHERE} "
        "AND descricao_cnae IS NOT NULL ORDER BY descricao_cnae"
    )
    return [r[0] for r in con.execute(sql).fetchall()]


@cached
def get_porte_options(con) -> list[str]:
    sql = (
        f"SELECT DISTINCT porte_empresa_descricao FROM empresas WHERE {BASE_WHERE} "
        f"AND {PORTE_VALIDO} ORDER BY porte_empresa_descricao"
    )
    return [r[0] for r in con.execute(sql).fetchall()]


@cached
def get_situacao_options(con) -> list[str]:
    sql = f"SELECT DISTINCT situacao_cadastral FROM empresas WHERE {BASE_WHERE} ORDER BY situacao_cadastral"
    return [r[0] for r in con.execute(sql).fetchall()]


@cached
def get_ano_bounds(con) -> tuple[int, int]:
    sql = f"SELECT MIN(ano_abertura), MAX(ano_abertura) FROM empresas WHERE {BASE_WHERE}"
    row = con.execute(sql).fetchone()
    return int(row[0]), int(row[1])


@cached
def get_total_registros(con) -> int:
    return int(con.execute("SELECT COUNT(*) FROM empresas").fetchone()[0])


# ---------------------------------------------------------------------------
# KPIs
# ---------------------------------------------------------------------------

@cached
def _agregado_por_situacao(con, filtros: Filtros) -> dict:
    """SUM(empresas, mei, simples) agrupado por situação cadastral — usado por
    kpi_ativas, kpi_mei, kpi_simples e kpi_taxa_ativas_baixadas, que
    compartilham exatamente o mesmo WHERE (situação excluída do filtro).
    Uma varredura só em vez de quatro; os valores retornados são idênticos
    aos das queries individuais que isso substituiu."""
    where, params = _build_where(filtros, exclude=frozenset({"situacao"}))
    sql = f"""
        SELECT situacao_cadastral,
               SUM(qtd_empresas) AS empresas,
               SUM(qtd_empresas_mei) AS mei,
               SUM(qtd_empresas_simples) AS simples
        FROM empresas
        WHERE {where}
        GROUP BY situacao_cadastral
    """
    rows = con.execute(sql, params).fetchall()
    return {r[0]: (int(r[1] or 0), int(r[2] or 0), int(r[3] or 0)) for r in rows}


@cached
def kpi_ativas(con, filtros: Filtros) -> int:
    return _agregado_por_situacao(con, filtros).get("ATIVA", (0, 0, 0))[0]


@cached
def kpi_mei(con, filtros: Filtros) -> int:
    return _agregado_por_situacao(con, filtros).get("ATIVA", (0, 0, 0))[1]


@cached
def kpi_simples(con, filtros: Filtros) -> int:
    return _agregado_por_situacao(con, filtros).get("ATIVA", (0, 0, 0))[2]


@cached
def kpi_aberturas_periodo(con, filtros: Filtros) -> int:
    where, params = _build_where(filtros)
    sql = f"SELECT SUM(qtd_empresas) FROM empresas WHERE {where}"
    row = con.execute(sql, params).fetchone()
    return int(row[0] or 0)


@cached
def kpi_taxa_ativas_baixadas(con, filtros: Filtros) -> float:
    agregado = _agregado_por_situacao(con, filtros)
    ativas = agregado.get("ATIVA", (0, 0, 0))[0]
    baixadas = agregado.get("BAIXADA", (0, 0, 0))[0]
    total = ativas + baixadas
    return (ativas / total * 100) if total else 0.0


# ---------------------------------------------------------------------------
# Séries / distribuições / rankings
# ---------------------------------------------------------------------------

@cached
def serie_evolucao_anual(con, filtros: Filtros) -> list[dict]:
    where, params = _build_where(filtros)
    sql = f"""
        SELECT ano_abertura, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY ano_abertura
        ORDER BY ano_abertura
    """
    return _rows(con, sql, params)


@cached
def dist_porte(con, filtros: Filtros) -> list[dict]:
    where, params = _build_where(filtros, exclude=frozenset({"porte"}))
    sql = f"""
        SELECT porte_empresa_descricao AS porte, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where} AND {PORTE_VALIDO}
        GROUP BY porte_empresa_descricao
        ORDER BY total ASC
    """
    return _rows(con, sql, params)


@cached
def dist_situacao(con, filtros: Filtros) -> list[dict]:
    where, params = _build_where(filtros, exclude=frozenset({"situacao"}))
    sql = f"""
        SELECT situacao_cadastral, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY situacao_cadastral
        ORDER BY total DESC
    """
    return _rows(con, sql, params)


@cached
def ranking_cnae(con, filtros: Filtros, limite: int = 15) -> list[dict]:
    where, params = _build_where(filtros)
    sql = f"""
        SELECT codigo_cnae, descricao_cnae, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY codigo_cnae, descricao_cnae
        ORDER BY total DESC
        LIMIT {int(limite)}
    """
    return _rows(con, sql, params)


@cached
def mapa_por_uf(con, filtros: Filtros) -> list[dict]:
    where, params = _build_where(filtros, exclude=frozenset({"uf", "municipio"}))
    sql = f"""
        SELECT uf, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY uf
    """
    return _rows(con, sql, params)


@cached
def ranking_municipios(con, filtros: Filtros, limite: int = 1000) -> list[dict]:
    where, params = _build_where(filtros)
    sql = f"""
        SELECT municipio, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY municipio
        ORDER BY total DESC
        LIMIT {int(limite)}
    """
    return _rows(con, sql, params)
