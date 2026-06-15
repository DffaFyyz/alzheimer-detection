import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section className={`rounded-lg border border-clinical-line bg-white shadow-panel ${className}`}>
      {children}
    </section>
  );
}
