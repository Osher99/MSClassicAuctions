interface AvatarProps {
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes: Record<string, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

const colors = [
  "bg-maple-orange",
  "bg-maple-blue",
  "bg-maple-green",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-red-500",
];

const getInitial = (email?: string | null): string =>
  email ? email[0].toUpperCase() : "?";

const getColor = (email?: string | null): string => {
  if (!email) return "bg-slate-600";
  const hash = [...email].reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar = ({ email, size = "md", className = "" }: AvatarProps) => (
  <div
    className={`${sizes[size]} ${getColor(email)} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-maple-dark shadow-lg shrink-0 ${className}`}
    title={email ?? "Unknown user"}
  >
    {getInitial(email)}
  </div>
);
