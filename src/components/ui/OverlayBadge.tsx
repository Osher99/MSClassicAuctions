import type { ReactNode } from "react";

interface OverlayBadgeProps {
  children: ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

const positions: Record<string, string> = {
  "top-left": "top-3 left-3",
  "top-right": "top-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "bottom-right": "bottom-3 right-3",
};

export const OverlayBadge = ({
  children,
  position = "top-left",
  className = "",
}: OverlayBadgeProps) => (
  <div
    className={`absolute ${positions[position]} backdrop-blur-sm shadow-lg ${className}`}
  >
    {children}
  </div>
);
