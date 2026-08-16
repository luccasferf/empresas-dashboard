import { useMemo } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/lib/theme-provider";
import { fmtCnae, fmtInt, toTitleCase, truncarRotulo } from "@/lib/format";
import { ChartTooltipShell } from "@/components/dashboard/chart-tooltip";
import type { RankingCnaeItem } from "@/types/api";

export function CnaeRanking({ dados, height = 580 }: { dados: RankingCnaeItem[]; height?: number | `${number}%` }) {
  const { paleta } = useTheme();

  const linhas = useMemo(
    () =>
      [...dados]
        .sort((a, b) => b.total - a.total)
        .map((d) => ({
          ...d,
          codigoFmt: fmtCnae(d.codigo_cnae),
          descricaoFmt: toTitleCase(d.descricao_cnae),
        })),
    [dados],
  );
  const maxValor = Math.max(...linhas.map((d) => d.total), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={linhas} layout="vertical" margin={{ top: 4, right: 76, bottom: 4, left: 4 }} barCategoryGap="22%">
        <XAxis type="number" hide domain={[0, maxValor * 1.15]} />
        <YAxis
          type="category"
          dataKey="codigoFmt"
          tick={({ x, y, payload }) => {
            const linha = linhas.find((l) => l.codigoFmt === payload.value);
            const rotulo = `${payload.value}  ·  ${truncarRotulo(linha?.descricaoFmt ?? "", 42)}`;
            return (
              <text x={x} y={y} dy={4} textAnchor="end" fill={paleta.textPrimary} fontSize={12} fontFamily="Inter, sans-serif">
                {rotulo}
              </text>
            );
          }}
          axisLine={false}
          tickLine={false}
          width={340}
        />
        <Tooltip
          cursor={{ fill: paleta.grid, opacity: 0.4 }}
          content={({ active, payload }) => {
            const item = payload?.[0]?.payload as (typeof linhas)[number] | undefined;
            if (!item) return null;
            return (
              <ChartTooltipShell active={active}>
                <p className="font-bold">{item.codigoFmt}</p>
                <p>{item.descricaoFmt}</p>
                <p>{fmtInt(item.total)} empresas</p>
              </ChartTooltipShell>
            );
          }}
        />
        <Bar dataKey="total" fill={paleta.accent} radius={[0, 6, 6, 0]} isAnimationActive={false}>
          <LabelList
            dataKey="total"
            position="right"
            formatter={(v: unknown) => fmtInt(typeof v === "number" ? v : Number(v ?? 0))}
            style={{ fill: paleta.textPrimary, fontSize: 12, fontFamily: "Inter, sans-serif" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
