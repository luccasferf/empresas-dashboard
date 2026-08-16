import { useMemo } from "react";
import { toTitleCase } from "@/lib/format";

/** Texto legível do recorte geográfico/temporal atual — "em São Paulo, SP ·
 * abertas entre 2010 e 2026", etc. */
export function useEscopo(uf: string, municipios: string[], anoInicio: number, anoFim: number): string {
  return useMemo(() => {
    let base: string;
    if (uf === "Todos") base = "em todo o Brasil";
    else if (municipios.length === 1) base = `em ${toTitleCase(municipios[0])}, ${uf}`;
    else if (municipios.length > 1) base = `em ${municipios.length} municípios de ${uf}`;
    else base = `no estado de ${uf}`;
    return `${base} · abertas entre ${anoInicio} e ${anoFim}`;
  }, [uf, municipios, anoInicio, anoFim]);
}
