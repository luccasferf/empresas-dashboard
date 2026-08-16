import os

import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from utils import components, geo, hero_component, queries
from utils.db import get_connection
from utils.filters import renderizar_filtros
from utils.formatting import fmt_cnae, fmt_int, fmt_pct, hex_para_rgba
from utils.plotstyle import aplicar_tema, eixo_valores_ptbr, obter_paleta, truncar_rotulo
from utils.theme import gerar_css

# Preencha antes de publicar — aparecem nos links do rodapé.
AUTOR_LINKEDIN = "#"
AUTOR_GITHUB = "#"

st.set_page_config(page_title="DataNimbus — Cenário Empresarial Brasileiro", page_icon="🏢", layout="wide")

col_titulo, col_tema = st.columns([5, 1.5])
with col_tema:
    # Só ícone (sem "Escuro"/"Claro" por extenso): com texto, o toggle
    # truncava pra "Esc..." em telas de tablet — lua/sol sozinhos são um
    # padrão reconhecido o bastante pra dispensar o rótulo, e cabem em
    # qualquer largura.
    escolha_tema = st.segmented_control(
        "Tema",
        ["🌙", "☀️"],
        default="☀️",
        label_visibility="collapsed",
        key="tema_widget",
        width="stretch",
    )
tema = "claro" if escolha_tema == "☀️" else "escuro"
paleta = obter_paleta(tema)

_CSS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "style.css")
with open(_CSS_PATH, encoding="utf-8") as f:
    css_estrutural = f.read()
st.markdown(f"<style>{gerar_css(paleta)}{css_estrutural}</style>", unsafe_allow_html=True)

con = get_connection()
total_registros = con.execute("SELECT COUNT(*) FROM empresas").fetchone()[0]

with col_titulo:
    components.header(
        "DataNimbus — Cenário Empresarial Brasileiro",
        "Panorama nacional de empresas brasileiras a partir de dados públicos da Receita Federal",
    )

filtros, ano_min, ano_max = renderizar_filtros(con)

# Chips com os filtros fora do padrão + botão "limpar tudo" — só aparece
# quando há algo pra mostrar.
chips = []
if filtros.uf != "Todos":
    chips.append(f"UF: {filtros.uf}")
if filtros.municipios:
    chips.append(f"Município: {len(filtros.municipios)} selecionado(s)")
if filtros.cnaes:
    chips.append(f"CNAE: {len(filtros.cnaes)} selecionado(s)")
if filtros.portes:
    chips.append(f"Porte: {len(filtros.portes)} selecionado(s)")
if filtros.situacoes:
    chips.append(f"Situação: {len(filtros.situacoes)} selecionada(s)")
ano_inicio_padrao = max(2000, ano_min)
if (filtros.ano_inicio, filtros.ano_fim) != (ano_inicio_padrao, ano_max):
    chips.append(f"Período: {filtros.ano_inicio}–{filtros.ano_fim}")
components.active_filters_bar(chips)

# ---------------------------------------------------------------------------
# Hero KPI
# ---------------------------------------------------------------------------

total_ativas = queries.kpi_ativas(con, filtros)

if filtros.uf == "Todos":
    escopo = "em todo o Brasil"
elif filtros.municipios:
    if len(filtros.municipios) == 1:
        escopo = f"em {filtros.municipios[0].title()}, {filtros.uf}"
    else:
        escopo = f"em {len(filtros.municipios)} municípios de {filtros.uf}"
else:
    escopo = f"no estado de {filtros.uf}"

hero_component.hero_kpi_animado(
    "Empresas ativas no Brasil",
    total_ativas,
    f"{escopo} · abertas entre {filtros.ano_inicio} e {filtros.ano_fim}",
    paleta,
    badge=f"📊 Base analisada: {fmt_int(total_registros)} registros",
)

# ---------------------------------------------------------------------------
# Linha de KPIs
# ---------------------------------------------------------------------------

mei = queries.kpi_mei(con, filtros)
simples = queries.kpi_simples(con, filtros)
aberturas = queries.kpi_aberturas_periodo(con, filtros)
taxa = queries.kpi_taxa_ativas_baixadas(con, filtros)
taxa_classe = "status-good" if taxa >= 50 else "status-critical"

components.kpi_row(
    [
        ("🏢 Empresas ativas", fmt_int(total_ativas), None, None),
        ("👤 MEIs ativos", fmt_int(mei), None, None),
        ("🧾 Empresas no Simples Nacional", fmt_int(simples), None, None),
        ("📈 Aberturas no período", fmt_int(aberturas), None, None),
        (
            "🛡️ Taxa de sobrevivência",
            fmt_pct(taxa),
            taxa_classe,
            "Empresas ativas ÷ (ativas + baixadas) no período e recorte selecionados",
        ),
    ]
)

# ---------------------------------------------------------------------------
# Distribuição geográfica — mapa por UF, ou por município quando uma UF
# específica está selecionada (codigo_municipio é código interno da Receita
# Federal, não IBGE — o mapa de município usa um cruzamento por nome, ver
# geo.py). Toggle "Mapa"/"Lista" pra quem prefere números a cores.
# ---------------------------------------------------------------------------

col_titulo_geo, col_vis_geo = st.columns([5, 1.5])
with col_titulo_geo:
    components.section_title("Distribuição geográfica")
with col_vis_geo:
    visualizacao_geo = st.segmented_control(
        "Visualização",
        ["🗺️ Mapa", "📋 Lista"],
        default="🗺️ Mapa",
        label_visibility="collapsed",
        key="geo_visualizacao",
        width="stretch",
    )

if filtros.uf == "Todos":
    df_mapa = queries.mapa_por_uf(con, filtros)
    if df_mapa.empty:
        st.info("Nenhum dado para os filtros selecionados.")
    elif visualizacao_geo == "📋 Lista":
        df_ordenado = df_mapa.sort_values("total", ascending=False)
        itens = [(uf, fmt_int(total), total) for uf, total in zip(df_ordenado["uf"], df_ordenado["total"])]
        components.ranking_lista(itens)
    else:
        # O Brasil não é um retângulo — um mapa em largura cheia sempre sobra
        # espaço vazio nas laterais. Dividir com um painel de "Top 8" ao lado
        # estreita o mapa (fica mais perto da proporção real do país) E ocupa
        # o espaço com conteúdo de verdade em vez de deixar em branco.
        titulo_escopo = (
            f"Empresas por UF — {', '.join(filtros.situacoes)}"
            if filtros.situacoes
            else "Empresas por UF — todas as situações cadastrais"
        )
        col_mapa, col_top = st.columns([2.1, 1])
        with col_mapa:
            fig = geo.figura_mapa_uf(df_mapa, paleta, titulo=titulo_escopo)
            st.plotly_chart(fig, use_container_width=True, theme=None, config={"displayModeBar": False})
        with col_top:
            df_top = df_mapa.sort_values("total", ascending=False).head(8)
            itens_top = [(uf, fmt_int(total), total) for uf, total in zip(df_top["uf"], df_top["total"])]
            components.ranking_lista(itens_top, titulo="Top 8 estados")
else:
    # limite bem acima do maior número de municípios de uma UF (MG tem 853) —
    # na prática isso traz TODOS os municípios da UF selecionada, não só um top N.
    df_mun = queries.ranking_municipios(con, filtros, limite=1000)
    if df_mun.empty:
        st.info("Nenhum dado para os filtros selecionados.")
    elif visualizacao_geo == "📋 Lista":
        df_ordenado = df_mun.sort_values("total", ascending=False)
        itens = [(m.title(), fmt_int(total), total) for m, total in zip(df_ordenado["municipio"], df_ordenado["total"])]
        components.ranking_lista(itens, altura=520)
    else:
        col_mapa, col_top = st.columns([2.1, 1])
        with col_mapa:
            fig = geo.figura_mapa_municipios(df_mun, filtros.uf, paleta, titulo=f"Empresas por município em {filtros.uf}")
            st.plotly_chart(fig, use_container_width=True, theme=None, config={"displayModeBar": False})
        with col_top:
            df_top = df_mun.sort_values("total", ascending=False).head(8)
            itens_top = [(m.title(), fmt_int(total), total) for m, total in zip(df_top["municipio"], df_top["total"])]
            components.ranking_lista(itens_top, titulo="Top 8 municípios")

# ---------------------------------------------------------------------------
# Evolução de aberturas por ano
# ---------------------------------------------------------------------------

components.section_title("Evolução de aberturas por ano")

df_evol = queries.serie_evolucao_anual(con, filtros)
if df_evol.empty:
    st.info("Nenhum dado para os filtros selecionados.")
else:
    anos = df_evol["ano_abertura"].tolist()
    totais = df_evol["total"].tolist()
    # O último ano da base é sempre parcial (o ano ainda não terminou) — uma
    # linha contínua faz a queda parecer uma retração real de aberturas, quando
    # é só menos tempo decorrido. Separamos num segmento tracejado à parte,
    # ligado ao último ano completo só pra não deixar a linha "flutuando".
    ano_parcial = anos[-1] == ano_max and len(anos) > 1

    fig = go.Figure()
    anos_completos = anos[:-1] if ano_parcial else anos
    totais_completos = totais[:-1] if ano_parcial else totais
    fig.add_trace(
        go.Scatter(
            x=anos_completos,
            y=totais_completos,
            mode="lines+markers",
            line=dict(color=paleta["accent"], width=2.5, shape="spline", smoothing=0.3),
            marker=dict(size=5, color=paleta["accent"]),
            fill="tozeroy",
            fillcolor=hex_para_rgba(paleta["accent"], 0.08),
            customdata=[fmt_int(v) for v in totais_completos],
            hovertemplate="<b>%{x}</b><br>%{customdata} empresas<extra></extra>",
            showlegend=False,
        )
    )
    if ano_parcial:
        fig.add_trace(
            go.Scatter(
                x=anos[-2:],
                y=totais[-2:],
                mode="lines+markers",
                line=dict(color=paleta["text_muted"], width=2.5, dash="dash"),
                marker=dict(size=[0, 8], color=paleta["text_muted"]),
                customdata=[fmt_int(v) for v in totais[-2:]],
                hovertemplate="<b>%{x} — dado parcial</b><br>%{customdata} empresas até o momento"
                "<br><i>ano ainda em andamento</i><extra></extra>",
                showlegend=False,
            )
        )

    aplicar_tema(fig, paleta, titulo="Novas empresas abertas por ano", altura=380)
    valores, textos = eixo_valores_ptbr(max(totais))
    fig.update_yaxes(tickvals=valores, ticktext=textos, title=None, range=[0, valores[-1] * 1.08])
    fig.update_xaxes(title=None, dtick=max(1, (filtros.ano_fim - filtros.ano_inicio) // 12))

    if ano_parcial:
        fig.add_annotation(
            x=anos[-1],
            y=float(totais[-1]),
            text=f"{anos[-1]} (parcial)",
            showarrow=True,
            arrowhead=2,
            arrowsize=0.8,
            arrowcolor=paleta["text_muted"],
            ax=-40,
            ay=-32,
            font=dict(size=11, color=paleta["text_secondary"], family="Inter, sans-serif"),
            bgcolor=paleta["surface"],
            bordercolor=paleta["border"],
            borderpad=4,
        )

    st.plotly_chart(fig, use_container_width=True, theme=None, config={"displayModeBar": False})

# ---------------------------------------------------------------------------
# Porte e situação cadastral, lado a lado
# ---------------------------------------------------------------------------

col_porte, col_situacao = st.columns(2)

with col_porte:
    components.section_title("Distribuição por porte")
    df_porte = queries.dist_porte(con, filtros)
    if df_porte.empty:
        st.info("Nenhum dado para os filtros selecionados.")
    else:
        cores = [paleta["porte_ordinal"].get(p, paleta["text_muted"]) for p in df_porte["porte"]]
        fig = px.bar(df_porte, x="total", y="porte", orientation="h")
        fig.update_traces(
            marker_color=cores,
            text=[fmt_int(v) for v in df_porte["total"]],
            textposition="outside",
            textfont=dict(size=13),
            cliponaxis=False,
            hovertemplate="<b>%{y}</b><br>%{text} empresas<extra></extra>",
        )
        valores, textos = eixo_valores_ptbr(df_porte["total"].max())
        aplicar_tema(fig, paleta, altura=300)
        fig.update_xaxes(tickvals=valores, ticktext=textos, title=None, showticklabels=False, range=[0, valores[-1] * 1.25])
        fig.update_yaxes(title=None, automargin=True, tickfont=dict(size=13))
        fig.update_layout(bargap=0.4)
        st.plotly_chart(fig, use_container_width=True, theme=None, config={"displayModeBar": False})

with col_situacao:
    components.section_title("Situação cadastral")
    df_sit = queries.dist_situacao(con, filtros)
    if df_sit.empty:
        st.info("Nenhum dado para os filtros selecionados.")
    else:
        total_geral = df_sit["total"].sum()
        cores = [paleta["cor_situacao"].get(s, paleta["text_muted"]) for s in df_sit["situacao_cadastral"]]
        percentuais = [v / total_geral * 100 if total_geral else 0 for v in df_sit["total"]]
        # Fatias abaixo de 2% não recebem rótulo dentro do gráfico — a numerinha
        # espremida numa fatia minúscula só polui; legenda + hover já cobrem o valor.
        textos_fatia = [
            f"{fmt_pct(p)}<br>{fmt_int(v)}" if p >= 2 else "" for p, v in zip(percentuais, df_sit["total"])
        ]
        rotulos_legenda = [f"{s} · {fmt_pct(p)}" for s, p in zip(df_sit["situacao_cadastral"], percentuais)]
        fig = go.Figure(
            go.Pie(
                labels=rotulos_legenda,
                values=df_sit["total"],
                hole=0.58,
                marker=dict(colors=cores, line=dict(color=paleta["surface"], width=2)),
                text=textos_fatia,
                textinfo="text",
                # Texto sempre escuro: fica sobre as fatias coloridas (verde/laranja/
                # cinza), que são as mesmas nos dois temas — não deve seguir a paleta.
                textfont=dict(color="#111318", size=11.5, family="Inter, sans-serif"),
                hovertext=df_sit["situacao_cadastral"],
                customdata=[fmt_int(v) for v in df_sit["total"]],
                hovertemplate="<b>%{hovertext}</b><br>%{customdata} empresas<extra></extra>",
            )
        )
        aplicar_tema(fig, paleta, altura=300, mostrar_legenda=True)
        fig.update_layout(legend=dict(orientation="v", x=1.0, xanchor="left", y=0.5, yanchor="middle", font=dict(size=12)))
        st.plotly_chart(fig, use_container_width=True, theme=None, config={"displayModeBar": False})

# ---------------------------------------------------------------------------
# Top 15 setores de atividade (CNAE)
# ---------------------------------------------------------------------------

components.section_title("Top 15 setores de atividade (CNAE)")

df_cnae = queries.ranking_cnae(con, filtros, limite=15).sort_values("total")
if df_cnae.empty:
    st.info("Nenhum dado para os filtros selecionados.")
else:
    # codigo_fmt (ex: "4781-4/00") é a chave de verdade (única) — vira a
    # categoria do eixo. Importante usar o código FORMATADO, não o cru: uma
    # string só de dígitos ("4781400") faz o Plotly inferir o eixo Y como
    # numérico/contínuo em vez de categórico, e as barras saem espaçadas pela
    # magnitude do código em vez de por categoria (bagunça tudo). O texto
    # exibido combina código + descrição encurtada; a descrição completa some
    # no hover. Truncar só a exibição evita o bug de duas descrições colidindo
    # no mesmo rótulo (o que faria o Plotly empilhar as barras).
    df_cnae["codigo_fmt"] = df_cnae["codigo_cnae"].apply(fmt_cnae)
    df_cnae["descricao_fmt"] = df_cnae["descricao_cnae"].str.title()

    valores, textos = eixo_valores_ptbr(df_cnae["total"].max())
    fig = px.bar(df_cnae, x="total", y="codigo_fmt", orientation="h")
    fig.update_traces(
        marker_color=paleta["accent"],
        text=[fmt_int(v) for v in df_cnae["total"]],
        textposition="outside",
        cliponaxis=False,  # sem isso, o rótulo da maior barra corta em telas estreitas
        customdata=list(zip(df_cnae["codigo_fmt"], df_cnae["descricao_fmt"])),
        hovertemplate="<b>%{customdata[0]}</b><br>%{customdata[1]}<br>%{text} empresas<extra></extra>",
    )
    aplicar_tema(fig, paleta, altura=580)
    # Padding do range bem mais generoso que "parece necessário" no desktop: o
    # rótulo de valor (textposition="outside") ocupa um número de PIXELS ~fixo,
    # mas esse range é medido em unidades de dado — numa tela estreita a mesma
    # % de padding vira poucos pixels de verdade e o texto corta. Com código +
    # descrição no eixo Y (mais largo que só a descrição), sobra ainda menos
    # espaço horizontal pro valor, por isso o padding aqui é maior que nos
    # outros gráficos de barra.
    fig.update_xaxes(tickvals=valores, ticktext=textos, title=None, showticklabels=False, range=[0, valores[-1] * 1.55])
    rotulos_eixo = [
        f"{cod}  ·  {truncar_rotulo(desc, 26)}" for cod, desc in zip(df_cnae["codigo_fmt"], df_cnae["descricao_fmt"])
    ]
    fig.update_yaxes(
        type="category",
        tickvals=df_cnae["codigo_fmt"], ticktext=rotulos_eixo, title=None, automargin=True, tickfont=dict(size=12),
    )
    st.plotly_chart(fig, use_container_width=True, theme=None, config={"displayModeBar": False})

# ---------------------------------------------------------------------------
# Sobre o DataNimbus
# ---------------------------------------------------------------------------

components.secao_sobre(
    titulo="☁️ Sobre o DataNimbus",
    texto=(
        "O DataNimbus é uma plataforma de engenharia e análise de dados desenvolvida para processar, "
        "consolidar e explorar dados públicos de empresas brasileiras disponibilizados pela Receita Federal."
    ),
    tecnologias=["Python", "Streamlit", "DuckDB", "Databricks", "Plotly", "Dados públicos da Receita Federal"],
)

components.footer(
    "DataNimbus · Plataforma de dados empresariais brasileiros",
    "Dados públicos da Receita Federal · Projeto de portfólio",
    [("LinkedIn", AUTOR_LINKEDIN), ("Código-fonte", AUTOR_GITHUB)],
)
