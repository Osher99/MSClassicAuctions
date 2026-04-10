import type { ReactNode } from "react";

interface PriceTagProps {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
}

const sizes: Record<string, { amount: string; currency: string }> = {
  sm: { amount: "text-sm font-bold", currency: "text-xs ml-1" },
  md: { amount: "text-lg font-bold", currency: "text-sm ml-1" },
  lg: { amount: "text-3xl font-bold", currency: "text-sm" },
};

const formatPrice = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    const val = Math.floor(amount / 1_000_000_000);
    return `${val}b`;
  }
  if (amount >= 1_000_000) {
    const val = Math.floor(amount / 1_000_000);
    return `${val}m`;
  }
  if (amount >= 1_000) {
    const val = Math.floor(amount / 1_000);
    return `${val}k`;
  }
  return amount.toString();
};

const mesoSizes: Record<string, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export const PriceTag = ({
  amount,
  currency = "Mesos",
  size = "md",
}: PriceTagProps) => (
  <div className="flex items-center gap-1">
    <span className={`${mesoSizes[size]}`}>💰</span>
    <span className={`text-maple-gold ${sizes[size].amount}`}>
      {formatPrice(amount)}
    </span>
    <span className={`text-maple-gold/70 ${sizes[size].currency}`}>
      {currency}
    </span>
  </div>
);

interface ImageFrameProps {
  src?: string;
  alt?: string;
  fallbackIcon?: string;
  aspectRatio?: string;
  maxHeight?: string;
  objectFit?: "cover" | "contain";
  children?: ReactNode;
  className?: string;
}

export const ImageFrame = ({
  src,
  alt = "",
  fallbackIcon = "💰",
  aspectRatio = "aspect-[4/3]",
  maxHeight,
  objectFit = "cover",
  children,
  className = "",
}: ImageFrameProps) => (
  <div
    className={`relative ${aspectRatio} ${maxHeight ?? ""} bg-slate-800 overflow-hidden ${className}`}
  >
    {src ? (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-${objectFit} transition-transform duration-500`}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        <span className="text-5xl opacity-60">{fallbackIcon}</span>
      </div>
    )}
    {children}
  </div>
);
