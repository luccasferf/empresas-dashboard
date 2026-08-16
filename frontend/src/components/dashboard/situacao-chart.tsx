import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "@/lib/theme-provider";
import { fmtInt, fmtPct } from "@/lib/format";
import { ChartTooltipShell } from "@/components/dashboard/chart-tooltip";
import type { DistSituacaoItem } from "@/types/api";

/** Cor de texto fixa (não segue o tema) — sempre escura, pois desenha sobre
 * as fatias coloridas (verde/laranja/cinza), que são as mesmas nos dois temas. */
const LABEL_COLOR = "#111318";

interface SliceLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  pct: number;
  total: number;
}

function SliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct, total }: SliceLabelProps) {
  if (pct < 2) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} textAnchor="middle" fill={LABEL_COLOR} fontSize={11.5} fontFamily="Inter, sans-serif">
      <tspan x={x} dy="-0.3em" fontWeight={700}>
        {fmtPct(pct)}
      </tspan>
      <tspan x={x} dy="1.2em">
        {fmtInt(total)}
      </tspan>
    </text>
  );
}

export function SituacaoChart({ dados, height = 300 }: { dados: DistSituacaoItem[]; height?: number | `${number}%` }) {
  const { paleta } = useTheme();
  const totalGeral = dados.reduce((acc, d) => acc + d.total, 0);

  const dadosComPct = useMemo(
    () =>
      dados.map((d) => ({
        ...d,
        pct: totalGeral ? (d.total / totalGeral) * 100 : 0,
      })),
    [dados, totalGeral],
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Pie
          data={dadosComPct}
          dataKey="total"
          nameKey="situacao_cadastral"
          innerRadius="58%"
          outerRadius="88%"
          paddingAngle={1.5}
          stroke={paleta.surface}
          strokeWidth={2}
          isAnimationActive={false}
          animationDuration={500}
          label={(props) => <SliceLabel {...(props as unknown as SliceLabelProps)} />}
          labelLine={false}
        >
          {dadosComPct.map((d) => (
            <Cell key={d.situacao_cadastral} fill={paleta.corSituacao[d.situacao_cadastral] ?? paleta.textMuted} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            const item = payload?.[0]?.payload as (DistSituacaoItem & { pct: number }) | undefined;
            if (!item) return null;
            return (
              <ChartTooltipShell active={active}>
                <p className="font-bold">{item.situacao_cadastral}</p>
                <p>{fmtInt(item.total)} empresas</p>
              </ChartTooltipShell>
            );
          }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={9}
          formatter={(_value, entry) => {
            const item = entry.payload as unknown as DistSituacaoItem & { pct: number };
            return (
              <span style={{ color: paleta.textSecondary, fontSize: 12 }}>
                {item.situacao_cadastral} · {fmtPct(item.pct)}
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
