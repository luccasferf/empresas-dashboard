import { toTitleCase } from "@/lib/format";
import type { Filtros } from "@/types/api";

/** Chips legíveis dos filtros atualmente aplicados — usado na faixa compacta
 * abaixo do header e no contador do botão "Filtros". */
export function buildFiltroChips(filtros: Filtros, anoInicioPadrao: number, anoMax: number): string[] {
  const chips: string[] = [];
  if (filtros.uf !== "Todos") chips.push(`UF: ${filtros.uf}`);
  if (filtros.municipios.length === 1) chips.push(`Município: ${toTitleCase(filtros.municipios[0])}`);
  else if (filtros.municipios.length > 1) chips.push(`Município: ${filtros.municipios.length} selecionado(s)`);
  if (filtros.cnaes.length) chips.push(`CNAE: ${filtros.cnaes.length} selecionado(s)`);
  if (filtros.portes.length) chips.push(`Porte: ${filtros.portes.length} selecionado(s)`);
  if (filtros.situacoes.length) chips.push(`Situação: ${filtros.situacoes.length} selecionada(s)`);
  if (filtros.anoInicio !== anoInicioPadrao || filtros.anoFim !== anoMax) {
    chips.push(`Período: ${filtros.anoInicio}–${filtros.anoFim}`);
  }
  return chips;
}
