"""
Mapas coropléticos — por UF e por município.

Os geojsons (data/br_uf.geojson, data/br_municipios.geojson) foram baixados
uma única vez da API oficial do IBGE (servicodados.ibge.gov.br/api/v2/malhas)
e são lidos do disco local — o app nunca faz essa chamada em runtime.

O mapa por município tem uma complicação a mais: `codigo_municipio` na nossa
base é o código interno da Receita Federal (TABMUN), não o código IBGE que a
malha usa — não dá pra casar direto pelo código. O que casa muito bem (99,66%
dos municípios, 99,85% do total de empresas em peso) é o NOME normalizado
(maiúsculo, sem acento, hífen virando espaço) cruzado com a UF — por isso
data/municipios_crosswalk.json mapeia "UF|NOME NORMALIZADO" -> código IBGE.
Os ~0,34% que não batem são nomes que a Receita Federal ainda usa na forma
antiga/divergente do IBGE (ex.: "Parati" vs. "Paraty") — ficam de fora do
mapa (sem cor), não travam nada.
"""
import json
import math
import os
import unicodedata

import plotly.graph_objects as go
import streamlit as st

from utils.formatting import fmt_int, fmt_pct
from utils.plotstyle import eixo_valores_ptbr

_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
_GEOJSON_PATH = os.path.join(_DATA_DIR, "br_uf.geojson")
_GEOJSON_MUNICIPIOS_PATH = os.path.join(_DATA_DIR, "br_municipios.geojson")
_CROSSWALK_MUNICIPIOS_PATH = os.path.join(_DATA_DIR, "municipios_crosswalk.json")

# Código IBGE (2 dígitos) -> sigla da UF. Tabela oficial e estável (não muda).
SIGLA_POR_CODIGO_IBGE = {
    "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA", "16": "AP", "17": "TO",
    "21": "MA", "22": "PI", "23": "CE", "24": "RN", "25": "PB", "26": "PE", "27": "AL", "28": "SE", "29": "BA",
    "31": "MG", "32": "ES", "33": "RJ", "35": "SP",
    "41": "PR", "42": "SC", "43": "RS",
    "50": "MS", "51": "MT", "52": "GO", "53": "DF",
}

# Sigla -> nome completo da UF. Só pra exibição (tooltip do mapa) — tabela
# oficial e estável, não vem de nenhuma consulta.
NOME_POR_SIGLA_UF = {
    "RO": "Rondônia", "AC": "Acre", "AM": "Amazonas", "RR": "Roraima", "PA": "Pará",
    "AP": "Amapá", "TO": "Tocantins", "MA": "Maranhão", "PI": "Piauí", "CE": "Ceará",
    "RN": "Rio Grande do Norte", "PB": "Paraíba", "PE": "Pernambuco", "AL": "Alagoas",
    "SE": "Sergipe", "BA": "Bahia", "MG": "Minas Gerais", "ES": "Espírito Santo",
    "RJ": "Rio de Janeiro", "SP": "São Paulo", "PR": "Paraná", "SC": "Santa Catarina",
    "RS": "Rio Grande do Sul", "MS": "Mato Grosso do Sul", "MT": "Mato Grosso",
    "GO": "Goiás", "DF": "Distrito Federal",
}


@st.cache_resource
def carregar_geojson():
    with open(_GEOJSON_PATH, encoding="utf-8") as f:
        geojson = json.load(f)
    for feature in geojson["features"]:
        codigo = str(feature["properties"]["codarea"])
        feature["properties"]["sigla"] = SIGLA_POR_CODIGO_IBGE.get(codigo, codigo)
    return geojson


def figura_mapa_uf(df, paleta: dict, titulo=None):
    """df precisa ter colunas `uf` e `total`."""
    geojson = carregar_geojson()

    total_geral = df["total"].sum()
    textos = [
        f"<b>{NOME_POR_SIGLA_UF.get(uf, uf)}</b><br>{fmt_int(total)} empresas"
        f"<br>{fmt_pct(total / total_geral * 100) if total_geral else '0,0%'} do total filtrado"
        for uf, total in zip(df["uf"], df["total"])
    ]
    valores_cbar, textos_cbar = eixo_valores_ptbr(df["total"].max(), n=4)

    fig = go.Figure(
        go.Choropleth(
            geojson=geojson,
            locations=df["uf"],
            z=df["total"],
            featureidkey="properties.sigla",
            colorscale=paleta["escala_sequencial"],
            marker_line_color=paleta["page"],
            marker_line_width=0.8,
            text=textos,
            hovertemplate="%{text}<extra></extra>",
            colorbar=dict(
                title=None,
                thickness=12,
                len=0.7,
                tickvals=valores_cbar,
                ticktext=textos_cbar,
                tickfont=dict(color=paleta["text_secondary"], size=11, family="Inter, sans-serif"),
                outlinewidth=0,
            ),
        )
    )

    # fitbounds="locations" já enquadra certinho, mas o Brasil não é um
    # retângulo — sempre sobra algum espaço vazio num card retangular. Desde
    # que o mapa passou a dividir a linha com o painel "Top 8" (ver app.py),
    # o card ficou mais estreito, então a altura ideal também caiu — um valor
    # bom aqui é o que deixa o mapa preenchendo a maior parte do card sem
    # sobrar faixa vazia em cima/embaixo nem nas laterais.
    fig.update_geos(
        fitbounds="locations",
        visible=False,
        bgcolor=paleta["surface"],
        showframe=False,
    )
    layout = dict(
        paper_bgcolor=paleta["surface"],
        plot_bgcolor=paleta["surface"],
        margin=dict(l=0, r=0, t=48 if titulo else 6, b=0),
        height=460,
        font=dict(family="Inter, sans-serif", color=paleta["text_primary"]),
        transition=dict(duration=450, easing="cubic-in-out"),
    )
    if titulo:
        layout["title"] = dict(
            text=titulo, font=dict(size=15, color=paleta["text_primary"], family="Inter, sans-serif"), x=0.02, xanchor="left"
        )
    fig.update_layout(**layout)
    return fig


def _normalizar_nome(nome: str) -> str:
    nome = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode("ascii")
    nome = nome.replace("-", " ").replace("'", " ")
    return " ".join(nome.upper().split())


@st.cache_resource
def carregar_geojson_municipios():
    with open(_GEOJSON_MUNICIPIOS_PATH, encoding="utf-8") as f:
        return json.load(f)


@st.cache_resource
def carregar_crosswalk_municipios():
    with open(_CROSSWALK_MUNICIPIOS_PATH, encoding="utf-8") as f:
        return json.load(f)


def _ticks_escala_log(valor_min: float, valor_max: float):
    """Ticks em potências de 10 (e metades, 5x10^n) dentro do intervalo dos
    dados — pros valores REAIS (não o log) aparecerem na legenda."""
    if valor_max <= 0:
        return [0], ["0"]
    candidatos = []
    exp = 0
    while 10**exp <= valor_max * 1.01:
        for mult in (1, 5):
            v = mult * 10**exp
            if valor_min * 0.5 <= v <= valor_max * 1.01:
                candidatos.append(v)
        exp += 1
    candidatos = sorted(set(candidatos)) or [round(valor_max)]
    return candidatos, [fmt_int(v) for v in candidatos]


def figura_mapa_municipios(df, uf: str, paleta: dict, titulo=None):
    """df precisa ter colunas `municipio` e `total`, todos de uma mesma UF.

    A cor usa escala LOGARÍTMICA: a capital costuma concentrar dezenas de
    vezes mais empresas que o resto do estado (São Paulo capital vs. o resto
    de SP, por exemplo), então uma escala linear deixa praticamente todo o
    mapa "lavado" numa cor só e só a capital aparece. Log preserva a
    variação entre as cidades menores. O hover e a legenda mostram os
    valores reais, não o log — só a cor de preenchimento é que é log.
    """
    geojson_completo = carregar_geojson_municipios()
    crosswalk = carregar_crosswalk_municipios()

    features_uf = [f for f in geojson_completo["features"] if f["properties"].get("sigla_uf") == uf]
    geojson_uf = {"type": "FeatureCollection", "features": features_uf}

    total_uf = df["total"].sum()
    codareas, totais, textos = [], [], []
    for municipio, total in zip(df["municipio"], df["total"]):
        codarea = crosswalk.get(f"{uf}|{_normalizar_nome(municipio)}")
        if codarea:
            codareas.append(codarea)
            totais.append(total)
            pct = fmt_pct(total / total_uf * 100) if total_uf else "0,0%"
            textos.append(f"<b>{municipio.title()}</b><br>{fmt_int(total)} empresas<br>{pct} do estado")

    totais_log = [math.log10(max(t, 1)) for t in totais]
    valores_cbar, textos_cbar = _ticks_escala_log(min(totais) if totais else 0, max(totais) if totais else 0)
    valores_cbar_log = [math.log10(max(v, 1)) for v in valores_cbar]

    fig = go.Figure(
        go.Choropleth(
            geojson=geojson_uf,
            locations=codareas,
            z=totais_log,
            featureidkey="properties.codarea",
            colorscale=paleta["escala_sequencial"],
            marker_line_color=paleta["page"],
            marker_line_width=0.4,
            text=textos,
            hovertemplate="%{text}<extra></extra>",
            colorbar=dict(
                title=None,
                thickness=12,
                len=0.6,
                tickvals=valores_cbar_log,
                ticktext=textos_cbar,
                tickfont=dict(color=paleta["text_secondary"], size=11, family="Inter, sans-serif"),
                outlinewidth=0,
            ),
        )
    )

    fig.update_geos(
        fitbounds="locations",
        visible=False,
        bgcolor=paleta["surface"],
        showframe=False,
    )
    layout = dict(
        paper_bgcolor=paleta["surface"],
        plot_bgcolor=paleta["surface"],
        margin=dict(l=0, r=0, t=48 if titulo else 6, b=0),
        height=480,
        font=dict(family="Inter, sans-serif", color=paleta["text_primary"]),
        transition=dict(duration=450, easing="cubic-in-out"),
    )
    if titulo:
        layout["title"] = dict(
            text=titulo, font=dict(size=15, color=paleta["text_primary"], family="Inter, sans-serif"), x=0.02, xanchor="left"
        )
    fig.update_layout(**layout)
    return fig
