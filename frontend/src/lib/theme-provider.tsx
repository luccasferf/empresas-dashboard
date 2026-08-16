import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { obterPaleta, type Paleta, type Tema } from "@/lib/palette";

const STORAGE_KEY = "datanimbus-theme";

interface ThemeContextValue {
  tema: Tema;
  paleta: Paleta;
  toggleTema: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function temaInicial(): Tema {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (salvo === "claro" || salvo === "escuro") return salvo;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "escuro");
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      tema,
      paleta: obterPaleta(tema),
      toggleTema: () => setTema((t) => (t === "claro" ? "escuro" : "claro")),
    }),
    [tema],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme precisa estar dentro de <ThemeProvider>");
  return ctx;
}
