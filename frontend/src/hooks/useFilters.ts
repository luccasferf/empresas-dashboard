import { useCallback, useEffect, useRef, useState } from "react";
import { FILTROS_VAZIOS, type Filtros } from "@/types/api";

/**
 * Estado dos filtros globais. Espelha utils/filters.py: quando os bounds reais
 * de ano chegam da API, o período padrão vira [max(2000, ano_min), ano_max] —
 * só a primeira vez (um ref evita sobrescrever escolha do usuário em refetches
 * subsequentes de /api/meta).
 */
export function useFilters(anoMin: number | undefined, anoMax: number | undefined) {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current || anoMin === undefined || anoMax === undefined) return;
    bootstrapped.current = true;
    setFiltros((f) => ({ ...f, anoInicio: Math.max(2000, anoMin), anoFim: anoMax }));
  }, [anoMin, anoMax]);

  const setUf = useCallback((uf: string) => {
    setFiltros((f) => ({ ...f, uf, municipios: [] }));
  }, []);

  const setMunicipios = useCallback((municipios: string[]) => {
    setFiltros((f) => ({ ...f, municipios }));
  }, []);

  const setCnaes = useCallback((cnaes: string[]) => {
    setFiltros((f) => ({ ...f, cnaes }));
  }, []);

  const setPortes = useCallback((portes: string[]) => {
    setFiltros((f) => ({ ...f, portes }));
  }, []);

  const setSituacoes = useCallback((situacoes: string[]) => {
    setFiltros((f) => ({ ...f, situacoes }));
  }, []);

  const setPeriodo = useCallback((anoInicio: number, anoFim: number) => {
    setFiltros((f) => ({ ...f, anoInicio, anoFim }));
  }, []);

  const limpar = useCallback(() => {
    if (anoMin === undefined || anoMax === undefined) return;
    setFiltros({ ...FILTROS_VAZIOS, anoInicio: Math.max(2000, anoMin), anoFim: anoMax });
  }, [anoMin, anoMax]);

  return { filtros, setUf, setMunicipios, setCnaes, setPortes, setSituacoes, setPeriodo, limpar };
}
