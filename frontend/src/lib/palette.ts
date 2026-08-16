/**
 * Paletas (clara/escura) — portadas 1:1 de utils/theme.py e utils/plotstyle.py
 * (o app Streamlit). Os tokens de superfície/texto/borda também existem como
 * CSS vars em index.css (pra classes utilitárias do Tailwind); este módulo
 * existe à parte porque gráficos (Recharts, mapa) precisam dos valores em JS,
 * não em CSS — mesma dualidade que o Python tinha (CSS vars pro layout,
 * dict `paleta` pro Plotly).
 */

export type Tema = "claro" | "escuro";

export interface Paleta {
  page: string;
  surface: string;
  accent: string;
  accentGlow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  grid: string;
  border: string;
  /** Rampa sequencial (mapa coroplético) — mesmo hue, clara -> escura por magnitude. */
  escalaSequencial: [number, string][];
  /** Rampa ordinal de porte — Micro < Pequena < Demais, mesmo hue do accent. */
  porteOrdinal: Record<string, string>;
  statusGood: string;
  statusWarning: string;
  statusSerious: string;
  statusCritical: string;
  /** Situação cadastral -> cor de status. Baixada é neutra (texto mudo), não "ruim". */
  corSituacao: Record<string, string>;
}

const STATUS = {
  statusGood: "#0CA30C",
  statusWarning: "#FAB219",
  statusSerious: "#EC835A",
  statusCritical: "#D03B3B",
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const PALETA_CLARA_BASE = {
  page: "#EEF1F6",
  surface: "#FFFFFF",
  accent: "#0E7490",
  textPrimary: "#0B0F19",
  textSecondary: "#45505F",
  textMuted: "#54606F",
  grid: "#E3E7EE",
  border: "rgba(11, 15, 25, 0.08)",
  escalaSequencial: [
    [0.0, "#E3F6FB"],
    [0.25, "#B8E9F5"],
    [0.5, "#7DD3E8"],
    [0.75, "#2FA8C7"],
    [1.0, "#0E7490"],
  ] as [number, string][],
  porteOrdinal: {
    "MICRO EMPRESA": "#7DD3E8",
    "EMPRESA DE PEQUENO PORTE": "#2FA8C7",
    DEMAIS: "#0E7490",
  },
};

const PALETA_ESCURA_BASE = {
  page: "#0A0E17",
  surface: "#121A2B",
  accent: "#22D3EE",
  textPrimary: "#F5F7FA",
  textSecondary: "#9AA5B8",
  textMuted: "#6B7590",
  grid: "#232C40",
  border: "rgba(255, 255, 255, 0.08)",
  escalaSequencial: [
    [0.0, "#0D2436"],
    [0.25, "#123E58"],
    [0.5, "#0F6A8C"],
    [0.75, "#149DBF"],
    [1.0, "#22D3EE"],
  ] as [number, string][],
  porteOrdinal: {
    "MICRO EMPRESA": "#0F6A8C",
    "EMPRESA DE PEQUENO PORTE": "#149DBF",
    DEMAIS: "#22D3EE",
  },
};

function corSituacao(textMuted: string): Record<string, string> {
  return {
    ATIVA: STATUS.statusGood,
    SUSPENSA: STATUS.statusWarning,
    INAPTA: STATUS.statusSerious,
    NULA: STATUS.statusCritical,
    BAIXADA: textMuted,
  };
}

export function obterPaleta(tema: Tema): Paleta {
  const base = tema === "claro" ? PALETA_CLARA_BASE : PALETA_ESCURA_BASE;
  return {
    ...base,
    ...STATUS,
    accentGlow: hexToRgba(base.accent, 0.14),
    corSituacao: corSituacao(base.textMuted),
  };
}

export const PALETA_CLARA = obterPaleta("claro");
export const PALETA_ESCURA = obterPaleta("escuro");
