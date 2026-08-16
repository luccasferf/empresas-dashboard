import { lazy, Suspense, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TopBar } from "@/components/layout/top-bar";
import { ActiveFiltersBar } from "@/components/dashboard/active-filters-bar";
import { FiltersDrawer } from "@/components/dashboard/filters-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilters } from "@/hooks/useFilters";
import { useActiveView } from "@/hooks/useActiveView";
import { useFilterOptions, useMeta } from "@/hooks/useApiQueries";
import { buildFiltroChips } from "@/lib/filtros";
import { OverviewView } from "@/views/overview-view";

// Cada view (exceto Overview, a tela inicial) só entra no bundle quando o
// usuário efetivamente navega até ela — mantém a navegação inicial leve.
const GeografiaView = lazy(() => import("@/views/geografia-view").then((m) => ({ default: m.GeografiaView })));
const EvolucaoView = lazy(() => import("@/views/evolucao-view").then((m) => ({ default: m.EvolucaoView })));
const EmpresasView = lazy(() => import("@/views/empresas-view").then((m) => ({ default: m.EmpresasView })));
const CnaeView = lazy(() => import("@/views/cnae-view").then((m) => ({ default: m.CnaeView })));
const SobreView = lazy(() => import("@/views/sobre-view").then((m) => ({ default: m.SobreView })));

function App() {
  const { data: meta } = useMeta();
  const { data: filterOptions } = useFilterOptions();
  const { view, setView } = useActiveView();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { filtros, setUf, setMunicipios, setCnaes, setPortes, setSituacoes, setPeriodo, limpar } = useFilters(
    meta?.ano_min,
    meta?.ano_max,
  );

  const anoMin = meta?.ano_min ?? 2000;
  const anoMax = meta?.ano_max ?? 2026;
  const anoInicioPadrao = Math.max(2000, anoMin);

  const filtroCount = useMemo(
    () => buildFiltroChips(filtros, anoInicioPadrao, anoMax).length,
    [filtros, anoInicioPadrao, anoMax],
  );

  return (
    <div className="relative flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      <div aria-hidden className="bg-grid-texture pointer-events-none fixed inset-0 -z-10 opacity-[0.05]" />

      <TopBar activeView={view} onChangeView={setView} filtroCount={filtroCount} onOpenFilters={() => setFiltersOpen(true)} />

      <ActiveFiltersBar filtros={filtros} anoMin={anoMin} anoMax={anoMax} onLimpar={limpar} />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:overflow-hidden lg:px-10 lg:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="h-full min-h-[560px] lg:min-h-0"
          >
            <Suspense fallback={<Skeleton className="h-full min-h-[400px] w-full" />}>
              {view === "overview" && <OverviewView filtros={filtros} />}
              {view === "geografia" && <GeografiaView filtros={filtros} />}
              {view === "evolucao" && <EvolucaoView filtros={filtros} />}
              {view === "empresas" && <EmpresasView filtros={filtros} />}
              {view === "cnae" && <CnaeView filtros={filtros} />}
              {view === "sobre" && <SobreView />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <FiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filtros={filtros}
        filterOptions={filterOptions}
        anoMin={anoMin}
        anoMax={anoMax}
        onUf={setUf}
        onMunicipios={setMunicipios}
        onCnaes={setCnaes}
        onPortes={setPortes}
        onSituacoes={setSituacoes}
        onPeriodo={setPeriodo}
        onLimpar={limpar}
      />
    </div>
  );
}

export default App;
