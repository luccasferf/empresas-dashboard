"""
Geração do bloco de CSS dependente do tema (claro/escuro) escolhido pelo
usuário no toggle da barra de topo.

O `@import` da fonte só é válido como a PRIMEIRA regra de um stylesheet — por
isso ele mora aqui (nesse bloco gerado dinamicamente) em vez do assets/style.css
estático: como o CSS final é montado como f"{gerar_css(paleta)}{estrutural}",
o @import precisa estar na frente de tudo, inclusive do :root.
"""


def gerar_css(paleta: dict) -> str:
    return f"""
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root {{
  --page: {paleta['page']};
  --surface: {paleta['surface']};
  --accent: {paleta['accent']};
  --text-primary: {paleta['text_primary']};
  --text-secondary: {paleta['text_secondary']};
  --text-muted: {paleta['text_muted']};
  --grid: {paleta['grid']};
  --status-good: {paleta['status_good']};
  --status-warning: {paleta['status_warning']};
  --status-serious: {paleta['status_serious']};
  --status-critical: {paleta['status_critical']};
  --border-hairline: {paleta['border']};
  --accent-glow: {paleta['accent_glow']};
}}
"""
