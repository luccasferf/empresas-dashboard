import { useMemo, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  disabled?: boolean;
  formatLabel?: (option: string) => string;
}

export function MultiSelect({ options, value, onChange, placeholder, disabled, formatLabel }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    if (!busca.trim()) return options;
    const alvo = busca.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(alvo));
  }, [options, busca]);

  function toggle(opcao: string) {
    onChange(value.includes(opcao) ? value.filter((v) => v !== opcao) : [...value, opcao]);
  }

  const label = value.length === 0 ? placeholder : value.length === 1 ? (formatLabel?.(value[0]) ?? value[0]) : `${value.length} selecionados`;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-[10px] border border-border bg-surface px-3 text-sm",
            "transition-colors duration-150 hover:border-accent focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--dn-accent-glow)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value.length === 0 ? "text-text-muted" : "text-text-primary",
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="size-4 shrink-0 text-text-muted" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[min(22rem,90vw)] rounded-xl border border-border bg-surface shadow-dn-md"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-4 text-text-muted" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar…"
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
            {value.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-status-critical"
              >
                <X className="size-3" /> limpar
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtradas.length === 0 && <p className="px-3 py-4 text-center text-xs text-text-muted">Nada encontrado.</p>}
            {filtradas.map((opcao) => {
              const checked = value.includes(opcao);
              return (
                <label
                  key={opcao}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text-primary hover:bg-page"
                >
                  <CheckboxPrimitive.Root
                    checked={checked}
                    onCheckedChange={() => toggle(opcao)}
                    className="flex size-4 shrink-0 items-center justify-center rounded border border-border data-[state=checked]:border-accent data-[state=checked]:bg-accent"
                  >
                    <CheckboxPrimitive.Indicator>
                      <Check className="size-3 text-page" />
                    </CheckboxPrimitive.Indicator>
                  </CheckboxPrimitive.Root>
                  <span className="truncate">{formatLabel?.(opcao) ?? opcao}</span>
                </label>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
