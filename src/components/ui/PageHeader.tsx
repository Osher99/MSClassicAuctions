import type { ReactNode } from "react";

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader = ({ icon, title, subtitle, action }: PageHeaderProps) => (
  <div className="bg-maple-dark/80 backdrop-blur-md rounded-2xl px-6 py-5 mb-8 border border-maple-border/50">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="text-slate-300 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  </div>
);
