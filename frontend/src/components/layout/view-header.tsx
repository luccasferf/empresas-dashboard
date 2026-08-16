import type { ReactNode } from "react";
import { motion } from "motion/react";

export function ViewHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mb-4 flex flex-wrap items-end justify-between gap-3"
    >
      <div>
        {kicker && (
          <p className="mb-1 text-[11.5px] font-bold uppercase tracking-[0.14em] text-accent">{kicker}</p>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-[1.85rem]">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-text-secondary">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}
