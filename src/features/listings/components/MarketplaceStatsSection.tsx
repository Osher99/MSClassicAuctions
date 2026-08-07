import { useMarketplaceStats } from "../hooks/useMarketplaceStats";
import { useCountUp } from "../hooks/useCountUp";
import { Card } from "@/components/ui";

const STATS = [
  { key: "users" as const, icon: "👥", label: "Users" },
  { key: "activeListings" as const, icon: "🛒", label: "Active Listings" },
  { key: "totalListings" as const, icon: "📦", label: "Total Listings" },
];

export const MarketplaceStatsSection = () => {
  const { stats, inView, sectionRef } = useMarketplaceStats();

  return (
    <div ref={sectionRef} className="mb-6">
      <Card padding="sm" className="flex divide-x divide-maple-border">
        {stats &&
          STATS.map(({ key, icon, label }) => (
            <StatBlock key={key} icon={icon} label={label} target={stats[key]} active={inView} />
          ))}
      </Card>
    </div>
  );
};

interface StatBlockProps {
  icon: string;
  label: string;
  target: number;
  active: boolean;
}

const StatBlock = ({ icon, label, target, active }: StatBlockProps) => {
  const value = useCountUp(target, active);

  return (
    <div className="flex-1 text-center px-2">
      <div className="text-2xl sm:text-3xl">{icon}</div>
      <div className="text-2xl sm:text-3xl font-bold text-maple-gold mt-1 tabular-nums">
        {value.toLocaleString()}
      </div>
      <div className="text-xs sm:text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
};
