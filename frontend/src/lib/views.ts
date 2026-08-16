import { BarChart3, Building2, Info, LayoutGrid, Map, TrendingUp, type LucideIcon } from "lucide-react";

export type ViewId = "overview" | "geografia" | "evolucao" | "empresas" | "cnae" | "sobre";

export interface ViewDef {
  id: ViewId;
  label: string;
  icon: LucideIcon;
}

export const VIEWS: ViewDef[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "geografia", label: "Geografia", icon: Map },
  { id: "evolucao", label: "Evolução", icon: TrendingUp },
  { id: "empresas", label: "Empresas", icon: Building2 },
  { id: "cnae", label: "CNAE", icon: BarChart3 },
  { id: "sobre", label: "Sobre", icon: Info },
];

export const VIEW_IDS = VIEWS.map((v) => v.id);

export function isViewId(v: string | null | undefined): v is ViewId {
  return !!v && (VIEW_IDS as string[]).includes(v);
}
