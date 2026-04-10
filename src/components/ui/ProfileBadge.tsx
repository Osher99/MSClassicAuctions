import { Avatar } from "./Avatar";

interface ProfileBadgeProps {
  email?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const prefix = local.slice(0, 2);
  const domainParts = domain.split(".");
  const ext = domainParts.pop() ?? "";
  return `${prefix}****@***.${ext}`;
};

const avatarSizes: Record<string, string> = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-12 h-12",
};

export const ProfileBadge = ({
  email,
  username,
  avatarUrl,
  subtitle,
  size = "sm",
  className = "",
}: ProfileBadgeProps) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    {avatarUrl ? (
      <img
        src={avatarUrl}
        alt={username || email || "User"}
        className={`${avatarSizes[size]} rounded-full object-cover ring-2 ring-maple-dark shadow-lg shrink-0`}
      />
    ) : (
      <Avatar email={email} size={size} />
    )}
    <div className="flex-1 min-w-0">
      <p
        className={`font-medium text-slate-300 truncate ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {username || (email ? maskEmail(email) : "Unknown")}
      </p>
      {subtitle && (
        <p
          className={`text-slate-500 ${
            size === "sm" ? "text-[11px]" : "text-xs"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  </div>
);
