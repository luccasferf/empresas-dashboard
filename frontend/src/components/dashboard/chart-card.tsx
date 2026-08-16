import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  isLoading: boolean;
  isEmpty?: boolean;
  height?: number;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function ChartCard({ isLoading, isEmpty, height = 340, children, className, noPadding }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        "overflow-hidden rounded-card border border-border bg-surface shadow-dn-sm transition-shadow duration-200",
        "hover:border-accent/40 hover:shadow-[0_0_0_1px_var(--dn-accent-glow),var(--shadow-dn-md)]",
        noPadding ? "" : "p-4",
        className,
      )}
    >
      {isLoading ? (
        <Skeleton style={{ height }} className="w-full" />
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 text-text-muted" style={{ height }}>
          <Inbox className="size-6" />
          <p className="text-sm">Nenhum dado para os filtros selecionados.</p>
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}
