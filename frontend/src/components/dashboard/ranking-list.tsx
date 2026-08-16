import { motion } from "motion/react";

export interface RankingItem {
  nome: string;
  valorFmt: string;
  valorNum: number;
}

export function RankingList({
  itens,
  titulo,
  maxHeight,
  fill,
}: {
  itens: RankingItem[];
  titulo?: string;
  maxHeight?: number;
  /** Preenche 100% da altura do container pai (usado dentro de views de
   * viewport única) em vez de depender de um `maxHeight` fixo em px. */
  fill?: boolean;
}) {
  const valorMax = Math.max(...itens.map((i) => i.valorNum), 1);

  return (
    <div className={`rounded-card border border-border bg-surface p-2.5 shadow-dn-sm ${fill ? "flex h-full flex-col" : ""}`}>
      {titulo && (
        <p className="px-3.5 pb-2.5 pt-2 text-[11.5px] font-bold uppercase tracking-wide text-text-secondary">
          {titulo}
        </p>
      )}
      <div
        className={`overflow-y-auto ${fill ? "min-h-0 flex-1" : ""}`}
        style={!fill && maxHeight ? { maxHeight } : undefined}
      >
        {itens.map((item, i) => (
          <motion.div
            key={item.nome}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i, 12) * 0.02 }}
            className="relative mb-0.5 flex items-center gap-3 overflow-hidden rounded-lg px-3.5 py-2"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-lg bg-accent-glow"
              style={{ width: `${Math.max(2, (item.valorNum / valorMax) * 100)}%` }}
            />
            <span className="relative z-10 w-6 shrink-0 text-xs font-bold text-text-muted">{i + 1}</span>
            <span className="relative z-10 flex-1 truncate text-[13.5px] font-semibold text-text-primary">
              {item.nome}
            </span>
            <span className="relative z-10 shrink-0 text-[13.5px] font-bold tabular-nums text-text-primary">
              {item.valorFmt}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
