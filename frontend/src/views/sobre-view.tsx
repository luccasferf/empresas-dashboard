import { Cloud } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeta } from "@/hooks/useApiQueries";

const AUTOR_LINKEDIN = "#";
const AUTOR_GITHUB = "#";

export function SobreView() {
  const { data: meta, isLoading } = useMeta();

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex w-full max-w-3xl flex-col items-center text-center"
      >
        <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-accent-glow text-accent shadow-[0_0_30px_var(--dn-accent-glow)]">
          <Cloud className="size-7" strokeWidth={2.2} />
        </span>

        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-accent">Sobre o projeto</p>
        <h1 className="text-gradient-accent mb-5 font-extrabold tracking-tight [font-size:clamp(2.25rem,5.5vw,3.5rem)]">
          DataNimbus
        </h1>

        <p className="max-w-xl text-[15.5px] leading-relaxed text-text-secondary">
          Todos os dias, milhares de empresas nascem, crescem e encerram suas atividades no Brasil — mas esse
          movimento fica escondido em bases de dados brutas, difíceis de explorar. O{" "}
          <strong className="text-text-primary">DataNimbus</strong> existe para tornar esse panorama visível: transforma
          os registros públicos da Receita Federal em um retrato claro e navegável do tecido empresarial brasileiro,
          por estado, setor, porte e período.
        </p>
        <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-text-secondary">
          Este projeto nasceu como exercício de portfólio — a aposta é que dados públicos, bem tratados e bem
          apresentados, contam uma história que vale a pena explorar.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          <div>
            <div className="text-gradient-accent font-extrabold tabular-nums [font-size:clamp(1.75rem,3.5vw,2.5rem)]">
              {isLoading || !meta ? <Skeleton className="h-[1em] w-40" /> : <AnimatedNumber value={meta.total_registros} />}
            </div>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-text-muted">
              registros analisados
            </p>
          </div>
          <div className="hidden h-10 w-px bg-border sm:block" />
          <div>
            <p className="font-extrabold tabular-nums text-text-primary [font-size:clamp(1.75rem,3.5vw,2.5rem)]">
              {isLoading || !meta ? (
                <Skeleton className="h-[1em] w-32" />
              ) : (
                new Date(meta.ultima_atualizacao).toLocaleDateString("pt-BR")
              )}
            </p>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-text-muted">
              última atualização
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-text-muted">Fonte: Receita Federal (dados públicos) · Projeto de portfólio</p>

        <div className="mt-8 flex gap-5 border-t border-border pt-6 text-sm font-semibold text-text-secondary">
          <a href={AUTOR_LINKEDIN} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
            LinkedIn
          </a>
          <a href={AUTOR_GITHUB} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
            Código-fonte
          </a>
        </div>
      </motion.div>
    </div>
  );
}
