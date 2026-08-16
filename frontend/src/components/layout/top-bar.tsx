import { Cloud, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { NavTabs } from "@/components/layout/nav-tabs";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { ViewId } from "@/lib/views";

export function TopBar({
  activeView,
  onChangeView,
  filtroCount,
  onOpenFilters,
}: {
  activeView: ViewId;
  onChangeView: (v: ViewId) => void;
  filtroCount: number;
  onOpenFilters: () => void;
}) {
  return (
    <div className="shrink-0 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-8">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/70 px-4 py-2.5 shadow-dn-md backdrop-blur-xl sm:px-5"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-glow text-accent shadow-[0_0_0_1px_var(--dn-accent-glow)]">
            <Cloud className="size-5" strokeWidth={2.2} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-text-primary">
            Data<span className="text-gradient-accent">Nimbus</span>
          </span>
        </div>

        <NavTabs active={activeView} onChange={onChangeView} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFilters}
            className="relative flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-[13px] font-semibold text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            <SlidersHorizontal className="size-3.5" />
            Filtros
            {filtroCount > 0 && (
              <span className="flex size-[18px] items-center justify-center rounded-full bg-accent text-[10px] font-bold text-page shadow-[0_0_10px_var(--dn-accent-glow)]">
                {filtroCount}
              </span>
            )}
          </button>
          <ThemeToggle />
        </div>
      </motion.header>
    </div>
  );
}
