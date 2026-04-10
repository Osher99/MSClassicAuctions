interface BadgeProps {
  children: string;
  variant?: "blue" | "orange" | "green" | "gold" | "purple" | "gray";
  size?: "sm" | "md";
  className?: string;
}

const variants: Record<string, string> = {
  blue: "bg-maple-blue/20 text-maple-blue",
  orange: "bg-maple-orange/20 text-maple-orange",
  green: "bg-maple-green/20 text-maple-green",
  gold: "bg-maple-gold/20 text-maple-gold",
  purple: "bg-purple-500/20 text-purple-400",
  gray: "bg-slate-500/20 text-slate-400",
};

const sizes: Record<string, string> = {
  sm: "text-[11px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export const Badge = ({
  children,
  variant = "blue",
  size = "md",
  className = "",
}: BadgeProps) => (
  <span
    className={`inline-block font-semibold rounded-full whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
  >
    {children}
  </span>
);
