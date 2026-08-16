"""
Todas as queries agregadas sobre a tabela local `empresas`.

A tabela já vem pré-agregada do Databricks (gold.powerbi_gestao_empresas):
cada linha representa uma combinação de dimensões (UF, município, CNAE, porte,
situação cadastral, natureza jurídica, ano de abertura) com métricas somáveis
(qtd_empresas, qtd_empresas_mei, etc). Por isso toda pergunta vira um
SUM(...) GROUP BY ... — nunca puxamos linha a linha pro pandas antes de agregar.

Filtros do usuário viram cláusulas WHERE parametrizadas (placeholders `?`),
nunca concatenação de string com o valor — evita qualquer risco de injeção
SQL mesmo com nomes de município/CNAE que tenham aspas.
"""
from dataclasses import dataclass, field

import streamlit as st

# Situação cadastral com código de parsing sujo (~13 linhas em 22M, artefato da
# fonte) e UFs que não são estado de fato (EX = exterior, NA = não informado)
# ficam de fora de tudo por padrão.
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


# ---------------------------------------------------------------------------
# Opções de filtro (cacheadas — mudam só quando o banco local é re-sincronizado)
# ---------------------------------------------------------------------------

@st.cache_data(show_spinner=False)
def get_uf_options(_con):
    sql = f"SELECT DISTINCT uf FROM empresas WHERE {BASE_WHERE} ORDER BY uf"
    return _con.execute(sql).df()["uf"].tolist()


@st.cache_data(show_spinner=False)
def get_municipio_options(_con, uf: str):
    if uf == "Todos":
        return []
    sql = f"SELECT DISTINCT municipio FROM empresas WHERE {BASE_WHERE} AND uf = ? ORDER BY municipio"
    return _con.execute(sql, [uf]).df()["municipio"].tolist()


@st.cache_data(show_spinner=False)
def get_cnae_options(_con):
    sql = f"SELECT DISTINCT descricao_cnae FROM empresas WHERE {BASE_WHERE} AND descricao_cnae IS NOT NULL ORDER BY descricao_cnae"
    return _con.execute(sql).df()["descricao_cnae"].tolist()


@st.cache_data(show_spinner=False)
def get_porte_options(_con):
    sql = f"SELECT DISTINCT porte_empresa_descricao FROM empresas WHERE {BASE_WHERE} AND {PORTE_VALIDO} ORDER BY porte_empresa_descricao"
    return _con.execute(sql).df()["porte_empresa_descricao"].tolist()


@st.cache_data(show_spinner=False)
def get_situacao_options(_con):
    sql = f"SELECT DISTINCT situacao_cadastral FROM empresas WHERE {BASE_WHERE} ORDER BY situacao_cadastral"
    return _con.execute(sql).df()["situacao_cadastral"].tolist()


@st.cache_data(show_spinner=False)
def get_ano_bounds(_con):
    """Min/max reais de ano_abertura na base — o slider de período reflete
    o que existe de fato nos dados, sem piso artificial."""
    sql = f"SELECT MIN(ano_abertura), MAX(ano_abertura) FROM empresas WHERE {BASE_WHERE}"
    row = _con.execute(sql).fetchone()
    return int(row[0]), int(row[1])


@st.cache_data(show_spinner=False)
def get_empresas_exterior(_con):
    """Empresas com sede no exterior (uf = 'EX'), fora do escopo do mapa/filtro de UF."""
    sql = "SELECT SUM(qtd_empresas) FROM empresas WHERE codigo_situacao_cadastral IN ('01','02','03','04','08') AND uf = 'EX'"
    row = _con.execute(sql).fetchone()
    return int(row[0] or 0)


# ---------------------------------------------------------------------------
# KPIs
# ---------------------------------------------------------------------------

@st.cache_data(show_spinner=False)
def kpi_ativas(_con, filtros: Filtros):
    where, params = _build_where(filtros, exclude=frozenset({"situacao"}))
    sql = f"SELECT SUM(qtd_empresas) FROM empresas WHERE {where} AND situacao_cadastral = 'ATIVA'"
    row = _con.execute(sql, params).fetchone()
    return int(row[0] or 0)


@st.cache_data(show_spinner=False)
def kpi_mei(_con, filtros: Filtros):
    where, params = _build_where(filtros, exclude=frozenset({"situacao"}))
    sql = f"SELECT SUM(qtd_empresas_mei) FROM empresas WHERE {where} AND situacao_cadastral = 'ATIVA'"
    row = _con.execute(sql, params).fetchone()
    return int(row[0] or 0)


@st.cache_data(show_spinner=False)
def kpi_simples(_con, filtros: Filtros):
    where, params = _build_where(filtros, exclude=frozenset({"situacao"}))
    sql = f"SELECT SUM(qtd_empresas_simples) FROM empresas WHERE {where} AND situacao_cadastral = 'ATIVA'"
    row = _con.execute(sql, params).fetchone()
    return int(row[0] or 0)


@st.cache_data(show_spinner=False)
def kpi_aberturas_periodo(_con, filtros: Filtros):
    where, params = _build_where(filtros)
    sql = f"SELECT SUM(qtd_empresas) FROM empresas WHERE {where}"
    row = _con.execute(sql, params).fetchone()
    return int(row[0] or 0)


@st.cache_data(show_spinner=False)
def kpi_taxa_ativas_baixadas(_con, filtros: Filtros):
    where, params = _build_where(filtros, exclude=frozenset({"situacao"}))
    sql = f"""
        SELECT situacao_cadastral, SUM(qtd_empresas)
        FROM empresas
        WHERE {where} AND situacao_cadastral IN ('ATIVA', 'BAIXADA')
        GROUP BY situacao_cadastral
    """
    rows = dict(_con.execute(sql, params).fetchall())
    ativas = rows.get("ATIVA", 0) or 0
    baixadas = rows.get("BAIXADA", 0) or 0
    total = ativas + baixadas
    return (ativas / total * 100) if total else 0.0


# ---------------------------------------------------------------------------
# Gráficos
# ---------------------------------------------------------------------------

@st.cache_data(show_spinner=False)
def serie_evolucao_anual(_con, filtros: Filtros):
    where, params = _build_where(filtros)
    sql = f"""
        SELECT ano_abertura, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY ano_abertura
        ORDER BY ano_abertura
    """
    return _con.execute(sql, params).df()


@st.cache_data(show_spinner=False)
def dist_porte(_con, filtros: Filtros):
    where, params = _build_where(filtros, exclude=frozenset({"porte"}))
    sql = f"""
        SELECT porte_empresa_descricao AS porte, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where} AND {PORTE_VALIDO}
        GROUP BY porte_empresa_descricao
        ORDER BY total ASC
    """
    return _con.execute(sql, params).df()


@st.cache_data(show_spinner=False)
def dist_situacao(_con, filtros: Filtros):
    where, params = _build_where(filtros, exclude=frozenset({"situacao"}))
    sql = f"""
        SELECT situacao_cadastral, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY situacao_cadastral
        ORDER BY total DESC
    """
    return _con.execute(sql, params).df()


@st.cache_data(show_spinner=False)
def ranking_cnae(_con, filtros: Filtros, limite: int = 15):
    # Agrupa por codigo_cnae (chave de verdade, sempre única) + descricao_cnae
    # — antes agrupava só pela descrição, que colide em 2 casos raros onde
    # dois códigos diferentes compartilham o mesmo texto de descrição (ex:
    # "GERAÇÃO DE ENERGIA ELÉTRICA"). Mesma agregação de sempre, só a chave
    # de agrupamento ficou mais precisa.
    where, params = _build_where(filtros)
    sql = f"""
        SELECT codigo_cnae, descricao_cnae, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY codigo_cnae, descricao_cnae
        ORDER BY total DESC
        LIMIT {int(limite)}
    """
    return _con.execute(sql, params).df()


@st.cache_data(show_spinner=False)
def mapa_por_uf(_con, filtros: Filtros):
    where, params = _build_where(filtros, exclude=frozenset({"uf", "municipio"}))
    sql = f"""
        SELECT uf, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY uf
    """
    return _con.execute(sql, params).df()


@st.cache_data(show_spinner=False)
def ranking_municipios(_con, filtros: Filtros, limite: int = 15):
    where, params = _build_where(filtros)
    sql = f"""
        SELECT municipio, SUM(qtd_empresas) AS total
        FROM empresas
        WHERE {where}
        GROUP BY municipio
        ORDER BY total DESC
        LIMIT {int(limite)}
    """
    return _con.execute(sql, params).df()
