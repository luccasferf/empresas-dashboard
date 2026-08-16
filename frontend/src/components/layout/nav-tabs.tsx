import { motion } from "motion/react";
import { VIEWS, type ViewId } from "@/lib/views";

export function NavTabs({ active, onChange }: { active: ViewId; onChange: (v: ViewId) => void }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-surface p-1 shadow-dn-sm"
    >
      {VIEWS.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-current={isActive ? "page" : undefined}
            className="relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors duration-150"
          >
            {isActive && (
              <motion.span
                layoutId="nav-indicator"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-full bg-accent shadow-[0_0_16px_var(--dn-accent-glow)]"
              />
            )}
            <item.icon className={`relative z-10 size-3.5 ${isActive ? "text-page" : "text-text-muted"}`} strokeWidth={2.3} />
            <span className={`relative z-10 ${isActive ? "text-page" : "text-text-secondary"}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
