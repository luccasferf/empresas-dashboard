"""Barra de filtros global do dashboard."""
import streamlit as st

from utils.queries import (
    Filtros,
    get_ano_bounds,
    get_cnae_options,
    get_municipio_options,
    get_porte_options,
    get_situacao_options,
    get_uf_options,
)

# As chaves dos widgets levam um sufixo de "geração": apagar a entrada do
# session_state (st.session_state.pop) reseta o valor no Python, mas na prática
# o componente visual do selectbox/multiselect do Streamlit não resincroniza o
# texto exibido (reproduzido isolado — é um comportamento do framework, não
# bug do app). Trocar a *chave* força o React a desmontar o widget velho e
# montar um novo do zero, com o valor padrão de verdade refletido na tela.
CHAVE_GERACAO = "f_geracao"


def _geracao() -> int:
    return st.session_state.get(CHAVE_GERACAO, 0)


def limpar_filtros():
    """Callback do botão 'Limpar filtros' — avança a geração, o que troca a
    key de todo widget de filtro e força remontagem com valores padrão."""
    st.session_state[CHAVE_GERACAO] = _geracao() + 1


def renderizar_filtros(con):
    """Retorna (Filtros, ano_min, ano_max) — os bounds voltam pra quem chamou
    poder decidir se o período selecionado é o padrão ou foi alterado."""
    ano_min, ano_max = get_ano_bounds(con)
    sufixo = _geracao()

    st.markdown('<div class="filter-bar">', unsafe_allow_html=True)
    col_uf, col_mun, col_cnae, col_porte, col_sit, col_ano = st.columns([1, 1.4, 2, 1.3, 1.3, 1.6])

    with col_uf:
        uf = st.selectbox("UF", ["Todos"] + get_uf_options(con), index=0, key=f"f_uf_{sufixo}")

    with col_mun:
        opcoes_municipio = get_municipio_options(con, uf) if uf != "Todos" else []
        municipios = st.multiselect(
            "Município",
            opcoes_municipio,
            disabled=(uf == "Todos"),
            placeholder="Selecione uma UF" if uf == "Todos" else "Todos",
            key=f"f_municipio_{sufixo}",
        )

    with col_cnae:
        cnaes = st.multiselect(
            "Setor de atividade (CNAE)", get_cnae_options(con), placeholder="Todos", key=f"f_cnae_{sufixo}"
        )

    with col_porte:
        portes = st.multiselect("Porte", get_porte_options(con), placeholder="Todos", key=f"f_porte_{sufixo}")

    with col_sit:
        situacoes = st.multiselect(
            "Situação cadastral", get_situacao_options(con), placeholder="Todas", key=f"f_situacao_{sufixo}"
        )

    with col_ano:
        ano_inicio, ano_fim = st.slider(
            "Período de abertura",
            min_value=ano_min,
            max_value=ano_max,
            value=(max(2000, ano_min), ano_max),
            key=f"f_ano_{sufixo}",
        )

    st.markdown("</div>", unsafe_allow_html=True)

    filtros = Filtros(
        uf=uf,
        municipios=tuple(municipios),
        cnaes=tuple(cnaes),
        portes=tuple(portes),
        situacoes=tuple(situacoes),
        ano_inicio=ano_inicio,
        ano_fim=ano_fim,
    )
    return filtros, ano_min, ano_max
