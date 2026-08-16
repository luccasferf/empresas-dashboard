"""Paletas (clara/escura) e helper de tema compartilhados por todos os gráficos Plotly."""
import math

from utils.formatting import fmt_int, hex_para_rgba

PALETA_ESCURA = dict(
    page="#0A0E17",
    surface="#121A2B",
    accent="#22D3EE",
    text_primary="#F5F7FA",
    text_secondary="#9AA5B8",
    text_muted="#6B7590",
    grid="#232C40",
    border="rgba(255, 255, 255, 0.08)",
    # Rampa sequencial de um hue só (ciano), clara -> escura conforme a magnitude.
    escala_sequencial=[
        [0.0, "#0D2436"],
        [0.25, "#123E58"],
        [0.5, "#0F6A8C"],
        [0.75, "#149DBF"],
        [1.0, "#22D3EE"],
    ],
    # Rampa ordinal (Micro < Pequena < Demais) — mesmo hue do accent, luminosidade
    # crescente. Porte é ordem de tamanho, não identidade — por isso 1 hue só.
    porte_ordinal={
        "MICRO EMPRESA": "#0F6A8C",
        "EMPRESA DE PEQUENO PORTE": "#149DBF",
        "DEMAIS": "#22D3EE",
    },
)

PALETA_CLARA = dict(
    page="#EEF1F6",
    surface="#FFFFFF",
    accent="#0E7490",
    text_primary="#0B0F19",
    text_secondary="#45505F",
    text_muted="#54606F",
    grid="#E3E7EE",
    border="rgba(11, 15, 25, 0.08)",
    escala_sequencial=[
        [0.0, "#E3F6FB"],
        [0.25, "#B8E9F5"],
        [0.5, "#7DD3E8"],
        [0.75, "#2FA8C7"],
        [1.0, "#0E7490"],
    ],
    porte_ordinal={
        "MICRO EMPRESA": "#7DD3E8",
        "EMPRESA DE PEQUENO PORTE": "#2FA8C7",
        "DEMAIS": "#0E7490",
    },
)

# Paleta de status — fixa, não muda entre tema claro/escuro (mesmo hex nos dois
# modos; só o contraste contra a superfície muda, e ambos foram validados).
STATUS_GOOD = "#0CA30C"
STATUS_WARNING = "#FAB219"
STATUS_SERIOUS = "#EC835A"
STATUS_CRITICAL = "#D03B3B"


def obter_paleta(tema: str) -> dict:
    """tema: 'claro' ou 'escuro'."""
    paleta = dict(PALETA_CLARA if tema == "claro" else PALETA_ESCURA)
    paleta["status_good"] = STATUS_GOOD
    paleta["status_warning"] = STATUS_WARNING
    paleta["status_serious"] = STATUS_SERIOUS
    paleta["status_critical"] = STATUS_CRITICAL
    # Situação cadastral -> cor de status (ativa=bom, suspensa=alerta, inapta=sério,
    # nula=crítico; baixada é estado neutro/permanente, não "ruim", por isso usa o
    # tom de texto mudo do tema em vez de uma cor de status).
    paleta["cor_situacao"] = {
        "ATIVA": STATUS_GOOD,
        "SUSPENSA": STATUS_WARNING,
        "INAPTA": STATUS_SERIOUS,
        "NULA": STATUS_CRITICAL,
        "BAIXADA": paleta["text_muted"],
    }
    # Glow sutil atrás do hero e fundo dos chips de filtro ativo — mesmo accent,
    # baixa opacidade. Calculado aqui (não hardcoded) pra acompanhar o accent
    # de cada tema automaticamente.
    paleta["accent_glow"] = hex_para_rgba(paleta["accent"], 0.14)
    return paleta


def aplicar_tema(fig, paleta: dict, titulo=None, altura=380, mostrar_legenda=False):
    fonte = dict(family="Inter, -apple-system, 'Segoe UI', sans-serif", color=paleta["text_primary"])
    layout = dict(
        paper_bgcolor=paleta["surface"],
        plot_bgcolor=paleta["surface"],
        font=fonte,
        height=altura,
        margin=dict(l=10, r=10, t=52 if titulo else 20, b=10),
        showlegend=mostrar_legenda,
        transition=dict(duration=450, easing="cubic-in-out"),
        legend=dict(font=dict(color=paleta["text_secondary"], size=12), orientation="h", y=-0.15),
        hoverlabel=dict(
            bgcolor=paleta["page"],
            font=dict(family="Inter, sans-serif", color=paleta["text_primary"], size=12),
            bordercolor=paleta["grid"],
        ),
    )
    if titulo:
        layout["title"] = dict(
            text=titulo, font=dict(size=15, color=paleta["text_primary"], family="Inter, sans-serif"), x=0.02, xanchor="left"
        )
    fig.update_layout(**layout)
    # automargin=True em ambos os eixos: sem isso, a margem fixa (10px) definida
    # acima corta rótulos grandes tipo "6.000.000" no eixo Y, sobrando só o "0"
    # final visível — sumiu sozinho enquanto st.plotly_chart(theme="streamlit")
    # (o padrão) recalculava margem por baixo dos panos; com theme=None isso
    # fica por nossa conta.
    # showgrid=False nos dois eixos: com rótulo direto em cada barra/ponto, a
    # grade linha-a-linha só compete visualmente com os números — poluía mais
    # do que ajudava a ler.
    fig.update_xaxes(showgrid=False, color=paleta["text_muted"], linecolor=paleta["grid"], zeroline=False, automargin=True)
    fig.update_yaxes(showgrid=False, gridcolor=paleta["grid"], zeroline=False, color=paleta["text_muted"], automargin=True)
    return fig


def _passo_bonito(valor_max: float, n: int = 5) -> float:
    if valor_max <= 0:
        return 1
    bruto = valor_max / n
    magnitude = 10 ** math.floor(math.log10(bruto))
    residual = bruto / magnitude
    if residual > 5:
        passo = 10 * magnitude
    elif residual > 2:
        passo = 5 * magnitude
    elif residual > 1:
        passo = 2 * magnitude
    else:
        passo = magnitude
    return passo


def truncar_rotulo(texto: str, max_chars: int = 44) -> str:
    """Encurta rótulos de categoria longos (nome de CNAE, de município) só na
    EXIBIÇÃO — nunca usar o resultado como chave de agrupamento/eixo: dois
    rótulos diferentes podem truncar pro mesmo texto (ex: "...municipal" vs
    "...intermunicipal"), e aí o Plotly empilha as duas barras como se fossem
    uma categoria só. Use tickvals=categoria_completa, ticktext=truncar_rotulo(...)."""
    if len(texto) <= max_chars:
        return texto
    return texto[: max_chars - 1].rstrip() + "…"


def eixo_valores_ptbr(valor_max: float, n: int = 5):
    """Gera (tickvals, ticktext) com números redondos formatados em PT-BR,
    pra plotar eixos sem depender do locale do Plotly.js (não é pt-BR por
    padrão) e sem abreviar (nunca '66 mi')."""
    passo = _passo_bonito(valor_max, n)
    topo = math.ceil(valor_max / passo) * passo if valor_max > 0 else passo
    qtd = int(round(topo / passo)) + 1
    valores = [i * passo for i in range(qtd)]
    textos = [fmt_int(v) for v in valores]
    return valores, textos
