import type { ReactNode } from "react";

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-3">
      <h2 className="border-l-[3px] border-accent py-0.5 pl-3 text-[1.15rem] font-bold text-text-primary">
        {title}
      </h2>
      {action}
    </div>
  );
}
