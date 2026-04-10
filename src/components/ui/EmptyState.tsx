import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  icon,
  title,
  subtitle,
  action,
}: EmptyStateProps) => (
  <div className="bg-maple-card border border-maple-border rounded-2xl text-center py-16 px-6">
    <span className="text-6xl block mb-4">{icon}</span>
    <h3 className="text-xl font-semibold text-slate-300">{title}</h3>
    {subtitle && <p className="text-slate-500 mt-2 mb-6">{subtitle}</p>}
    {action}
  </div>
);
