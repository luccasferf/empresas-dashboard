import { Receipt, ShieldCheck, TrendingUp, User } from "lucide-react";
import { motion } from "motion/react";
import { HeroKpi } from "@/components/dashboard/hero-kpi";
import { KpiCard, type KpiItem } from "@/components/dashboard/kpi-row";
import { SituacaoMini } from "@/components/dashboard/situacao-mini";
import { Skeleton } from "@/components/ui/skeleton";
import { useDistSituacao, useKpis, useMeta } from "@/hooks/useApiQueries";
import { useEscopo } from "@/hooks/useEscopo";
import { fmtInt, fmtPct } from "@/lib/format";
import type { Filtros } from "@/types/api";

export function OverviewView({ filtros }: { filtros: Filtros }) {
  const { data: meta, isLoading: metaLoading } = useMeta();
  const { data: kpis, isLoading: kpisLoading } = useKpis(filtros);
  const { data: distSituacao, isLoading: situacaoLoading } = useDistSituacao(filtros);
  const escopo = useEscopo(filtros.uf, filtros.municipios, filtros.anoInicio, filtros.anoFim);

  const pronta = meta !== undefined;
  const carregandoKpis = kpisLoading || !pronta;

  const items: KpiItem[] = [
    { icon: <User className="size-3.5" />, label: "MEIs ativos", value: fmtInt(kpis?.mei) },
    { icon: <Receipt className="size-3.5" />, label: "Empresas no Simples Nacional", value: fmtInt(kpis?.simples) },
    { icon: <TrendingUp className="size-3.5" />, label: "Aberturas no período", value: fmtInt(kpis?.aberturas) },
    {
      icon: <ShieldCheck className="size-3.5" />,
      label: "Taxa de sobrevivência",
      value: fmtPct(kpis?.taxa_sobrevivencia),
      tone: (kpis?.taxa_sobrevivencia ?? 0) >= 50 ? "good" : "critical",
      tooltip: "Empresas ativas ÷ (ativas + baixadas) no período e recorte selecionados",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="min-h-0 flex-1">
        <HeroKpi
          kicker="Panorama nacional"
          label="Empresas ativas no Brasil"
          value={kpis?.ativas}
          caption={escopo}
          isLoading={carregandoKpis}
          totalRegistros={meta?.total_registros}
          ultimaAtualizacao={meta?.ultima_atualizacao}
          metaLoading={metaLoading || !pronta}
        />
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="col-span-2 flex flex-col rounded-card border border-border bg-surface p-5 shadow-dn-sm"
        >
          <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
            Situação geral
          </p>
          <SituacaoMini dados={distSituacao} isLoading={situacaoLoading || !pronta} />
        </motion.div>

        {carregandoKpis
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[110px] rounded-card" />)
          : items.map((item, i) => <KpiCard key={item.label} item={item} index={i} />)}
      </div>
    </div>
  );
}
