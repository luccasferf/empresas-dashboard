import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { fmtInt } from "@/lib/format";

/** Contador animado — mesma sensação do hero KPI do app Streamlit (que usava
 * um <iframe> com JS puro por limitação do Streamlit); aqui é só motion. */
export function AnimatedNumber({ value }: { value: number }) {
  const [exibido, setExibido] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzMovimento) {
      setExibido(value);
      anterior.current = value;
      return;
    }
    const controls = animate(anterior.current, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setExibido(v),
      onComplete: () => {
        // Garante que o valor final exibido bate exatamente com `value` —
        // sem isso, a última amostra do rAF pode arredondar a 1-2 unidades
        // de distância do alvo real.
        anterior.current = value;
        setExibido(value);
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span className="tabular-nums">{fmtInt(exibido)}</span>;
}
