/**
 * Escalas de cor e geração de ticks "bonitos" (números redondos, sem
 * abreviação) — portado de utils/plotstyle.py e utils/geo.py.
 */
import { fmtInt } from "@/lib/format";

function passoBonito(valorMax: number, n = 5): number {
  if (valorMax <= 0) return 1;
  const bruto = valorMax / n;
  const magnitude = 10 ** Math.floor(Math.log10(bruto));
  const residual = bruto / magnitude;
  if (residual > 5) return 10 * magnitude;
  if (residual > 2) return 5 * magnitude;
  if (residual > 1) return 2 * magnitude;
  return magnitude;
}

export function eixoValoresPtBr(valorMax: number, n = 5): { valores: number[]; textos: string[] } {
  const passo = passoBonito(valorMax, n);
  const topo = valorMax > 0 ? Math.ceil(valorMax / passo) * passo : passo;
  const qtd = Math.round(topo / passo) + 1;
  const valores = Array.from({ length: qtd }, (_, i) => i * passo);
  return { valores, textos: valores.map(fmtInt) };
}

/** Ticks em potências de 10 (e metades) dentro do intervalo real dos dados. */
export function ticksEscalaLog(valorMin: number, valorMax: number): { valores: number[]; textos: string[] } {
  if (valorMax <= 0) return { valores: [0], textos: ["0"] };
  const candidatos: number[] = [];
  let exp = 0;
  while (10 ** exp <= valorMax * 1.01) {
    for (const mult of [1, 5]) {
      const v = mult * 10 ** exp;
      if (valorMin * 0.5 <= v && v <= valorMax * 1.01) candidatos.push(v);
    }
    exp++;
  }
  const unicos = [...new Set(candidatos)].sort((a, b) => a - b);
  const valores = unicos.length ? unicos : [Math.round(valorMax)];
  return { valores, textos: valores.map(fmtInt) };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Interpola uma cor dentro da rampa sequencial (stops [t, hex]) da paleta. */
export function interpolarSequencial(stops: [number, string][], t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  let lo = stops[0];
  let hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i][0] && clamped <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const span = hi[0] - lo[0] || 1;
  const localT = (clamped - lo[0]) / span;
  const [r1, g1, b1] = hexToRgb(lo[1]);
  const [r2, g2, b2] = hexToRgb(hi[1]);
  const r = Math.round(lerp(r1, r2, localT));
  const g = Math.round(lerp(g1, g2, localT));
  const b = Math.round(lerp(b1, b2, localT));
  return `rgb(${r}, ${g}, ${b})`;
}
