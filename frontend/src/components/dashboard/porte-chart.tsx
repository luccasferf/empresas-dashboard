import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/lib/theme-provider";
import { fmtInt } from "@/lib/format";
import { ChartTooltipShell } from "@/components/dashboard/chart-tooltip";
import type { DistPorteItem } from "@/types/api";

export function PorteChart({ dados, height = 300 }: { dados: DistPorteItem[]; height?: number | `${number}%` }) {
  const { paleta } = useTheme();

  const ordenado = useMemo(() => [...dados].sort((a, b) => b.total - a.total), [dados]);
  const maxValor = Math.max(...ordenado.map((d) => d.total), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={ordenado} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 4 }} barCategoryGap="28%">
        <XAxis type="number" hide domain={[0, maxValor * 1.25]} />
        <YAxis
          type="category"
          dataKey="porte"
          tick={{ fill: paleta.textPrimary, fontSize: 13, fontFamily: "Inter, sans-serif" }}
          axisLine={false}
          tickLine={false}
          width={150}
        />
        <Tooltip
          cursor={{ fill: paleta.grid, opacity: 0.4 }}
          content={({ active, payload }) => {
            const item = payload?.[0]?.payload as DistPorteItem | undefined;
            if (!item) return null;
            return (
              <ChartTooltipShell active={active}>
                <p className="font-bold">{item.porte}</p>
                <p>{fmtInt(item.total)} empresas</p>
              </ChartTooltipShell>
            );
          }}
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]} isAnimationActive={false}>
          {ordenado.map((d) => (
            <Cell key={d.porte} fill={paleta.porteOrdinal[d.porte] ?? paleta.textMuted} />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            formatter={(v: unknown) => fmtInt(typeof v === "number" ? v : Number(v ?? 0))}
            style={{ fill: paleta.textPrimary, fontSize: 13, fontFamily: "Inter, sans-serif" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
