/**
 * Formatação PT-BR — mesmas regras de utils/formatting.py (o app Streamlit),
 * só trocando `f"{n:,}".replace(",", ".")` por Intl.NumberFormat.
 */

const intFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0";
  return intFormatter.format(Math.round(n));
}

export function fmtPct(n: number | null | undefined, casas = 1): string {
  if (n === null || n === undefined) return "0,0%";
  return `${n.toFixed(casas).replace(".", ",")}%`;
}

/** '4781400' -> '4781-4/00' */
export function fmtCnae(codigo: string): string {
  const c = String(codigo).trim();
  if (c.length !== 7 || !/^\d+$/.test(c)) return c;
  return `${c.slice(0, 4)}-${c[4]}/${c.slice(5)}`;
}

export function truncarRotulo(texto: string, maxChars = 44): string {
  if (texto.length <= maxChars) return texto;
  return texto.slice(0, maxChars - 1).trimEnd() + "…";
}

export function toTitleCase(texto: string): string {
  return texto
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
