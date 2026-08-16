"""
Blocos de HTML/CSS reutilizáveis (hero, cards de KPI, título de seção).

Cada função monta o HTML como UMA string sem quebras de linha e faz UMA
chamada a st.markdown. Isso não é só estilo: o Streamlit passa o conteúdo
pelo parser Markdown antes de liberar o HTML. Um bloco HTML (tipo 6 do
CommonMark) termina na primeira linha em branco, e qualquer linha nova que
comece com 4+ espaços de indentação vira um bloco de código em vez de HTML.
Strings multi-linha indentadas (como um f-string "bonito") caem exatamente
nessas duas armadilhas — só o primeiro elemento renderiza como HTML de
verdade, o resto vira texto cru. Por isso tudo aqui sai em uma linha só.
"""
import html as html_lib
from typing import Optional

import streamlit as st

from utils.filters import limpar_filtros


def header(titulo: str, subtitulo: str, logo: str = "🇧🇷"):
    html = (
        f'<div class="app-header"><div class="app-title-row"><span class="app-logo">{logo}</span>'
        f'<div class="app-title">{titulo}</div></div><div class="app-subtitle">{subtitulo}</div></div>'
    )
    st.markdown(html, unsafe_allow_html=True)


def kpi_row(itens):
    """itens: lista de (label, valor, classe_extra_opcional, tooltip_opcional)."""
    cards = []
    for item in itens:
        label, valor, classe, tooltip = (list(item) + [None, None])[:4]
        classe_css = f" {classe}" if classe else ""
        title_attr = f' title="{html_lib.escape(tooltip)}"' if tooltip else ""
        cards.append(
            f'<div class="kpi-card"{title_attr}><div class="kpi-label">{label}</div>'
            f'<div class="kpi-value{classe_css}">{valor}</div></div>'
        )
    html = f'<div class="kpi-row">{"".join(cards)}</div>'
    st.markdown(html, unsafe_allow_html=True)


def section_title(texto: str):
    st.markdown(f'<div class="section-title">{texto}</div>', unsafe_allow_html=True)


def active_filters_bar(chips: list[str]):
    """Chips com os filtros atualmente aplicados + botão pra limpar tudo de
    uma vez. Some por completo quando não há nenhum filtro fora do padrão —
    não faz sentido ocupar espaço mostrando uma barra vazia."""
    if not chips:
        return
    col_chips, col_botao = st.columns([6, 1])
    with col_chips:
        html = '<div class="active-filters-row">' + "".join(f'<span class="filter-chip">{c}</span>' for c in chips) + "</div>"
        st.markdown(html, unsafe_allow_html=True)
    with col_botao:
        st.button("✕ Limpar filtros", key="btn_limpar_filtros", on_click=limpar_filtros, use_container_width=True)


def ranking_lista(itens: list[tuple[str, str, float]], altura: Optional[int] = None, titulo: Optional[str] = None):
    """itens: lista de (nome, valor_formatado, valor_numerico) já ordenada
    (maior primeiro). Cada linha ganha uma barra de fundo proporcional ao
    valor — meio lista, meio gráfico de barras, sem precisar do Plotly."""
    valor_max = max((v for _, _, v in itens), default=0) or 1
    linhas = []
    for i, (nome, valor_fmt, valor_num) in enumerate(itens, start=1):
        largura = max(2, valor_num / valor_max * 100)
        linhas.append(
            f'<div class="rank-row"><div class="rank-fill" style="width:{largura:.1f}%"></div>'
            f'<span class="rank-pos">{i}</span><span class="rank-nome">{nome}</span>'
            f'<span class="rank-valor">{valor_fmt}</span></div>'
        )
    titulo_html = f'<div class="rank-list-titulo">{titulo}</div>' if titulo else ""
    estilo = f' style="max-height:{altura}px;overflow-y:auto"' if altura else ""
    html = f'<div class="rank-list"{estilo}>{titulo_html}{"".join(linhas)}</div>'
    st.markdown(html, unsafe_allow_html=True)


def secao_sobre(titulo: str, texto: str, tecnologias: list[str]):
    tags_html = "".join(f'<span class="tech-tag">{t}</span>' for t in tecnologias)
    html = (
        f'<div class="about-card"><div class="about-title">{titulo}</div>'
        f'<div class="about-text">{texto}</div>'
        f'<div class="about-tags">{tags_html}</div></div>'
    )
    st.markdown(html, unsafe_allow_html=True)


def footer(linha1: str, linha2: str, links: list[tuple[str, str]]):
    links_html = " · ".join(f'<a href="{url}" target="_blank" rel="noopener">{label}</a>' for label, url in links)
    html = (
        f'<div class="app-footer"><div class="app-footer-texto"><div class="app-footer-linha1">{linha1}</div>'
        f'<div class="app-footer-linha2">{linha2}</div></div><div class="app-footer-links">{links_html}</div></div>'
    )
    st.markdown(html, unsafe_allow_html=True)
