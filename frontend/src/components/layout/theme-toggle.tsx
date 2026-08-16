import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeToggle() {
  const { tema, toggleTema } = useTheme();

  return (
    <ToggleGroup
      aria-label="Tema"
      value={tema}
      onValueChange={(v) => {
        if (v && v !== tema) toggleTema();
      }}
    >
      <ToggleGroupItem value="escuro" aria-label="Tema escuro">
        <Moon className="mx-auto size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="claro" aria-label="Tema claro">
        <Sun className="mx-auto size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
