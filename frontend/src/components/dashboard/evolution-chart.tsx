import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/lib/theme-provider";
import { fmtInt } from "@/lib/format";
import { ChartTooltipShell } from "@/components/dashboard/chart-tooltip";
import type { SerieEvolucaoItem } from "@/types/api";

interface Row {
  ano: number;
  completo: number | null;
  parcial: number | null;
}

export function EvolutionChart({
  dados,
  anoMaxGlobal,
  height = 380,
}: {
  dados: SerieEvolucaoItem[];
  anoMaxGlobal: number;
  height?: number | `${number}%`;
}) {
  const { paleta } = useTheme();

  const { rows, temParcial } = useMemo(() => {
    const anoParcial = dados.length > 1 && dados[dados.length - 1].ano_abertura === anoMaxGlobal;
    const linhas: Row[] = dados.map((d, i) => {
      const ehUltimo = i === dados.length - 1;
      const ehPenultimo = i === dados.length - 2;
      return {
        ano: d.ano_abertura,
        completo: anoParcial && ehUltimo ? null : d.total,
        parcial: anoParcial && (ehUltimo || ehPenultimo) ? d.total : null,
      };
    });
    return { rows: linhas, temParcial: anoParcial };
  }, [dados, anoMaxGlobal]);

  const maxValor = Math.max(...dados.map((d) => d.total), 1);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={rows} margin={{ top: 12, right: 16, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id="evolucaoFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={paleta.accent} stopOpacity={0.18} />
            <stop offset="100%" stopColor={paleta.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={paleta.grid} strokeOpacity={0.5} />
        <XAxis
          dataKey="ano"
          tick={{ fill: paleta.textMuted, fontSize: 12, fontFamily: "Inter, sans-serif" }}
          axisLine={{ stroke: paleta.grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: paleta.textMuted, fontSize: 12, fontFamily: "Inter, sans-serif" }}
          axisLine={false}
          tickLine={false}
          width={72}
          domain={[0, maxValor * 1.08]}
          tickFormatter={(v: number) => fmtInt(v)}
        />
        <Tooltip
          cursor={{ stroke: paleta.grid }}
          content={({ active, payload, label }) => {
            const valor = payload?.[0]?.value ?? payload?.[1]?.value;
            if (valor === null || valor === undefined) return null;
            const parcial = temParcial && label === rows[rows.length - 1]?.ano;
            return (
              <ChartTooltipShell active={active}>
                <p className="font-bold">
                  {label}
                  {parcial ? " — dado parcial" : ""}
                </p>
                <p>{fmtInt(valor as number)} empresas{parcial ? " até o momento" : ""}</p>
                {parcial && <p className="italic text-text-muted">ano ainda em andamento</p>}
              </ChartTooltipShell>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="completo"
          stroke={paleta.accent}
          strokeWidth={2.5}
          fill="url(#evolucaoFill)"
          dot={{ r: 3.5, fill: paleta.accent, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
          isAnimationActive={false}
          animationDuration={600}
        />
        <Line
          type="monotone"
          dataKey="parcial"
          stroke={paleta.textMuted}
          strokeWidth={2.5}
          strokeDasharray="6 4"
          dot={{ r: 3.5, fill: paleta.textMuted, strokeWidth: 0 }}
          connectNulls={false}
          isAnimationActive={false}
          animationDuration={600}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
