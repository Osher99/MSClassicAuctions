import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddings: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

export const Card = ({
  children,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) => (
  <div
    className={`bg-maple-card border border-maple-border rounded-2xl ${paddings[padding]} ${
      hover
        ? "hover:border-maple-orange/50 transition-all duration-300 hover:shadow-xl hover:shadow-maple-orange/10 hover:-translate-y-1"
        : ""
    } ${className}`}
  >
    {children}
  </div>
);
