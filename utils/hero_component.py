"""
Hero KPI com contador animado.

Único ponto do app que usa JavaScript. Streamlit não executa <script> dentro
de st.markdown (bloqueado por segurança), então a única via suportada pra
animação de verdade é st.components.v1.html — que roda num <iframe> isolado,
sem acesso ao resto da página. Por isso o card inteiro (não só o número) vive
aqui dentro: não dá pra abrir a div em uma chamada e fechar em outra depois
(cada st.markdown/components.html vira um fragmento HTML separado — ver
utils/components.py) e as variáveis CSS (--accent, --surface...) do resto do
app não atravessam a fronteira do iframe, então os hex resolvidos da paleta
são injetados direto no CSS deste documento.
"""
import html as html_lib

import streamlit.components.v1 as components


def hero_kpi_animado(label: str, valor: int, caption: str, paleta: dict, badge: str = "", altura: int = 210):
    label_seguro = html_lib.escape(label)
    caption_seguro = html_lib.escape(caption)
    badge_seguro = html_lib.escape(badge)
    badge_html = f'<div class="badge">{badge_seguro}</div>' if badge else ""

    doc = f"""<!doctype html>
<html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;800&display=swap');
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; padding: 0; height: 100%; background: transparent; overflow: hidden; }}
.card {{
  position: relative;
  font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
  background: radial-gradient(circle at 15% 20%, {paleta['accent_glow']} 0%, {paleta['surface']} 55%);
  border: 1px solid {paleta['border']};
  border-radius: 16px;
  padding: 28px 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}}
.label {{
  color: {paleta['text_secondary']};
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}}
.value {{
  color: {paleta['accent']};
  font-size: clamp(44px, 6vw, 84px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}}
.caption {{
  color: {paleta['text_muted']};
  font-size: 13px;
  margin-top: 8px;
}}
.badge {{
  position: absolute;
  top: 20px;
  right: 24px;
  color: {paleta['text_muted']};
  background: {paleta['page']};
  border: 1px solid {paleta['border']};
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}}
@media (max-width: 640px) {{
  .badge {{ display: none; }}
}}
</style></head>
<body>
  <div class="card">
    {badge_html}
    <div class="label">{label_seguro}</div>
    <div class="value" id="v">0</div>
    <div class="caption">{caption_seguro}</div>
  </div>
  <script>
    var alvo = {int(valor)};
    var el = document.getElementById('v');
    var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzMovimento) {{
      el.textContent = alvo.toLocaleString('pt-BR');
    }} else {{
      var duracao = 1100;
      var inicio = null;
      function facilitar(t) {{ return 1 - Math.pow(1 - t, 3); }}
      function passo(agora) {{
        if (inicio === null) inicio = agora;
        var t = Math.min(1, (agora - inicio) / duracao);
        el.textContent = Math.round(alvo * facilitar(t)).toLocaleString('pt-BR');
        if (t < 1) requestAnimationFrame(passo);
      }}
      requestAnimationFrame(passo);
    }}
  </script>
</body></html>"""

    components.html(doc, height=altura)
