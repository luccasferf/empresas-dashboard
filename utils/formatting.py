"""Formatação de números no padrão PT-BR (separador de milhar em ponto)."""


def fmt_int(n) -> str:
    if n is None:
        return "0"
    return f"{round(n):,}".replace(",", ".")


def fmt_pct(n, casas: int = 1) -> str:
    if n is None:
        return "0,0%"
    texto = f"{n:.{casas}f}".replace(".", ",")
    return f"{texto}%"


def hex_para_rgba(cor_hex: str, alpha: float) -> str:
    cor_hex = cor_hex.lstrip("#")
    r, g, b = int(cor_hex[0:2], 16), int(cor_hex[2:4], 16), int(cor_hex[4:6], 16)
    return f"rgba({r}, {g}, {b}, {alpha})"


def fmt_cnae(codigo) -> str:
    """'4781400' -> '4781-4/00' (formato padrão de exibição do código CNAE)."""
    codigo = str(codigo).strip()
    if len(codigo) != 7 or not codigo.isdigit():
        return codigo
    return f"{codigo[:4]}-{codigo[4]}/{codigo[5:]}"


def fmt_money(n) -> str:
    if n is None:
        return "R$ 0"
    inteiro = f"{n:,.0f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {inteiro}"
