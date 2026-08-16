import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { buildFiltroChips } from "@/lib/filtros";
import type { Filtros } from "@/types/api";

/** Faixa compacta de chips dos filtros ativos — some por completo quando não
 * há nenhum filtro aplicado, pra não roubar espaço vertical das views. */
export function ActiveFiltersBar({
  filtros,
  anoMin,
  anoMax,
  onLimpar,
}: {
  filtros: Filtros;
  anoMin: number;
  anoMax: number;
  onLimpar: () => void;
}) {
  const anoInicioPadrao = Math.max(2000, anoMin);
  const chips = buildFiltroChips(filtros, anoInicioPadrao, anoMax);

  return (
    <AnimatePresence>
      {chips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap items-center gap-2 overflow-hidden px-4 pb-2.5 sm:px-6 lg:px-10"
        >
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-pill border border-border bg-accent-glow px-2.5 py-0.5 text-[11.5px] font-semibold text-accent"
            >
              {chip}
            </span>
          ))}
          <button
            type="button"
            onClick={onLimpar}
            className="flex items-center gap-1 rounded-pill border border-border px-2.5 py-0.5 text-[11.5px] font-semibold text-text-secondary transition-colors hover:border-status-critical hover:text-status-critical"
          >
            <X className="size-3" /> Limpar filtros
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
