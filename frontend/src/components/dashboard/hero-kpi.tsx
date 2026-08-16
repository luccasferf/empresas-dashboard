import { Database, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtInt } from "@/lib/format";

interface HeroKpiProps {
  kicker: string;
  label: string;
  value: number | undefined;
  caption: string;
  isLoading: boolean;
  totalRegistros: number | undefined;
  ultimaAtualizacao: string | undefined;
  metaLoading: boolean;
}

function fmtData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/** Hero de tela cheia do Overview — o primeiro impacto visual do app.
 * Números grandes com texto em gradiente, orbs decorativos animados e as
 * informações de proveniência dos dados embutidas no próprio hero. */
export function HeroKpi({
  kicker,
  label,
  value,
  caption,
  isLoading,
  totalRegistros,
  ultimaAtualizacao,
  metaLoading,
}: HeroKpiProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-full flex-col justify-center overflow-hidden rounded-3xl border border-border p-8 shadow-dn-lg sm:p-10"
      style={{ background: "var(--dn-surface)" }}
    >
      <motion.span
        aria-hidden
        className="absolute -right-24 -top-24 size-72 rounded-full bg-accent opacity-[0.16] blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.14, 0.2, 0.14] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden
        className="absolute -bottom-28 -left-16 size-80 rounded-full bg-accent opacity-[0.1] blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <div
        aria-hidden
        className="bg-grid-texture pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ maskImage: "radial-gradient(ellipse 70% 90% at 0% 30%, black 0%, transparent 75%)" }}
      />

      <div className="relative z-10 mb-5 flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-accent" />
        </span>
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent">{kicker}</p>
      </div>

      <p className="relative z-10 mb-1 text-[15px] font-semibold text-text-secondary">{label}</p>
      <div className="text-gradient-accent relative z-10 font-extrabold tracking-tight [font-size:clamp(3.25rem,8vw,6.5rem)]">
        {isLoading || value === undefined ? (
          <Skeleton className="h-[1em] w-72 max-w-full" />
        ) : (
          <AnimatedNumber value={value} />
        )}
      </div>
      <p className="relative z-10 mt-2 text-sm text-text-muted">{caption}</p>

      <div className="relative z-10 mt-7 flex flex-wrap items-center gap-2">
        {metaLoading || totalRegistros === undefined ? (
          <>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-44" />
          </>
        ) : (
          <>
            <span className="inline-flex items-center rounded-pill border border-border bg-page/70 px-3 py-1 text-[11.5px] font-semibold text-text-muted backdrop-blur-sm">
              <Database className="mr-1.5 size-3" /> {fmtInt(totalRegistros)} registros analisados
            </span>
            {ultimaAtualizacao && (
              <span className="inline-flex items-center rounded-pill border border-border bg-page/70 px-3 py-1 text-[11.5px] font-semibold text-text-muted backdrop-blur-sm">
                <RefreshCw className="mr-1.5 size-3" /> Atualizado em {fmtData(ultimaAtualizacao)}
              </span>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
