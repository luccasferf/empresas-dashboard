import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useMunicipioOptions } from "@/hooks/useApiQueries";
import { toTitleCase } from "@/lib/format";
import type { FilterOptionsResponse, Filtros } from "@/types/api";

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filtros: Filtros;
  filterOptions: FilterOptionsResponse | undefined;
  anoMin: number;
  anoMax: number;
  onUf: (uf: string) => void;
  onMunicipios: (v: string[]) => void;
  onCnaes: (v: string[]) => void;
  onPortes: (v: string[]) => void;
  onSituacoes: (v: string[]) => void;
  onPeriodo: (inicio: number, fim: number) => void;
  onLimpar: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

/** Filtros globais em drawer lateral — estado é "staged" localmente e só
 * propaga pro estado real (via onUf/onMunicipios/…) no clique de "Aplicar",
 * como no wireframe do pedido. "Limpar" reseta o formulário local pros
 * valores padrão sem fechar o drawer. */
export function FiltersDrawer({
  open,
  onOpenChange,
  filtros,
  filterOptions,
  anoMin,
  anoMax,
  onUf,
  onMunicipios,
  onCnaes,
  onPortes,
  onSituacoes,
  onPeriodo,
  onLimpar,
}: FiltersDrawerProps) {
  const [staged, setStaged] = useState<Filtros>(filtros);

  useEffect(() => {
    if (open) setStaged(filtros);
  }, [open, filtros]);

  const { data: municipioOptions } = useMunicipioOptions(staged.uf);
  const anoInicioPadrao = Math.max(2000, anoMin);

  function aplicar() {
    onUf(staged.uf);
    onMunicipios(staged.municipios);
    onCnaes(staged.cnaes);
    onPortes(staged.portes);
    onSituacoes(staged.situacoes);
    onPeriodo(staged.anoInicio, staged.anoFim);
    onOpenChange(false);
  }

  function limpar() {
    setStaged({
      uf: "Todos",
      municipios: [],
      cnaes: [],
      portes: [],
      situacoes: [],
      anoInicio: anoInicioPadrao,
      anoFim: anoMax,
    });
    onLimpar();
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-border bg-surface shadow-dn-lg"
                >
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <DialogPrimitive.Title className="text-base font-bold text-text-primary">Filtros</DialogPrimitive.Title>
                    <DialogPrimitive.Close asChild>
                      <button
                        type="button"
                        aria-label="Fechar filtros"
                        className="flex size-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-page hover:text-text-primary"
                      >
                        <X className="size-4" />
                      </button>
                    </DialogPrimitive.Close>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-5">
                    {!filterOptions ? (
                      <p className="text-sm text-text-muted">Carregando opções…</p>
                    ) : (
                      <div className="flex flex-col gap-5">
                        <Field label="UF">
                          <Select
                            value={staged.uf}
                            onValueChange={(uf) => setStaged((s) => ({ ...s, uf, municipios: [] }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Todos">Todos</SelectItem>
                              {filterOptions.ufs.map((uf) => (
                                <SelectItem key={uf} value={uf}>
                                  {uf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field label="Município">
                          <MultiSelect
                            options={municipioOptions ?? []}
                            value={staged.municipios}
                            onChange={(municipios) => setStaged((s) => ({ ...s, municipios }))}
                            disabled={staged.uf === "Todos"}
                            placeholder={staged.uf === "Todos" ? "Selecione uma UF" : "Todos"}
                            formatLabel={toTitleCase}
                          />
                        </Field>

                        <Field label="Setor de atividade (CNAE)">
                          <MultiSelect
                            options={filterOptions.cnaes}
                            value={staged.cnaes}
                            onChange={(cnaes) => setStaged((s) => ({ ...s, cnaes }))}
                            placeholder="Todos"
                            formatLabel={toTitleCase}
                          />
                        </Field>

                        <Field label="Porte">
                          <MultiSelect
                            options={filterOptions.portes}
                            value={staged.portes}
                            onChange={(portes) => setStaged((s) => ({ ...s, portes }))}
                            placeholder="Todos"
                          />
                        </Field>

                        <Field label="Situação cadastral">
                          <MultiSelect
                            options={filterOptions.situacoes}
                            value={staged.situacoes}
                            onChange={(situacoes) => setStaged((s) => ({ ...s, situacoes }))}
                            placeholder="Todas"
                          />
                        </Field>

                        <Field label="Período de abertura">
                          <div className="flex h-10 items-center gap-3">
                            <span className="w-9 shrink-0 text-xs font-semibold tabular-nums text-text-muted">
                              {staged.anoInicio}
                            </span>
                            <Slider
                              min={anoMin}
                              max={anoMax}
                              step={1}
                              value={[staged.anoInicio, staged.anoFim]}
                              onValueChange={(v) => setStaged((s) => ({ ...s, anoInicio: v[0], anoFim: v[1] }))}
                            />
                            <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-text-muted">
                              {staged.anoFim}
                            </span>
                          </div>
                        </Field>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
                    <Button variant="ghost" onClick={limpar}>
                      Limpar
                    </Button>
                    <Button variant="solid" className="flex-1" onClick={aplicar}>
                      Aplicar filtros
                    </Button>
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
