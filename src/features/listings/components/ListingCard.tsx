import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import type { Listing, ItemStats } from "@/types";
import {
  PriceTag,
  ProfileBadge,
  Badge,
} from "@/components/ui";
import { getItemRequirementLabel } from "../utils/itemDisplay";

interface ListingCardProps {
  listing: Listing;
}

const statLabels: Record<keyof ItemStats, string> = {
  str: "STR",
  dex: "DEX",
  int: "INT",
  luk: "LUK",
  wepAtt: "ATT",
  wepMagicAtt: "M.ATT",
  wepDef: "DEF",
  wepMDef: "M.DEF",
  hp: "HP",
  mp: "MP",
  acc: "ACC",
  avoid: "AVOID",
  availableSlots: "Slots",
};

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  const timeAgo = listing.createdAt
    ? formatTimeAgo(listing.createdAt.toDate())
    : "";
  const requirementLabel = getItemRequirementLabel({
    name: listing.itemName,
    requiredLevel: listing.requiredLevel,
    overallCategory: listing.overallCategory,
    category: listing.category,
    subCategory: listing.subCategory,
    scrollSuccessRate: listing.scrollSuccessRate,
  });

  const tooltipId = `item-name-${listing.id}`;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group relative flex flex-col bg-maple-card border border-maple-border rounded-2xl overflow-hidden hover:border-maple-orange/50 transition-all duration-300 hover:shadow-xl hover:shadow-maple-orange/10 hover:-translate-y-1"
    >
      {/* Item icon + info */}
      <div className="p-4 bg-slate-800/50 space-y-2">
        <div className="flex items-center gap-3">
          <img
            src={listing.itemIconUrl}
            alt={listing.itemName}
            className="w-12 h-12 object-contain flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-white text-sm group-hover:text-maple-orange transition-colors truncate"
              data-tooltip-id={tooltipId}
              data-tooltip-content={listing.itemName}
            >
              {listing.itemName}
            </h3>
            <Tooltip
              id={tooltipId}
              place="top"
              className="!bg-slate-800 !text-white !text-xs !font-medium !rounded-lg !px-3 !py-1.5 !shadow-xl !border !border-maple-border !z-[9999]"
              opacity={1}
              delayShow={300}
              offset={8}
            />
            <p className="text-slate-400 text-xs mt-0.5">
              {listing.category} &middot; {listing.subCategory}
              {requirementLabel ? ` · ${requirementLabel}` : ""}
            </p>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-maple-blue/90 text-white">
            {listing.server}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 px-4 py-3 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {listing.overallCategory === "Equip" && (
            <Badge variant={listing.condition === "scrolled" ? "purple" : "green"} size="sm">
              {listing.condition === "scrolled" ? "✨ Scrolled" : "🧼 Clean"}
            </Badge>
          )}
          {listing.scrollSuccessRate != null && (
            <Badge variant="orange" size="sm">
              {listing.scrollSuccessRate}%
            </Badge>
          )}
          {listing.amount != null && listing.amount > 1 && (
            <Badge variant="gold" size="sm">
              x{listing.amount}
            </Badge>
          )}
          <Badge variant={listing.listingImageUrl ? "blue" : "gray"} size="sm">
            {listing.listingImageUrl ? "📸 Screenshot" : "No Screenshot"}
          </Badge>
          {listing.isInStore && (
            <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold whitespace-nowrap">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              LIVE
            </span>
          )}
        </div>
        <PriceTag amount={listing.price} size="sm" />
        {listing.description && (
          <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        )}
        {listing.overallCategory === "Equip" && listing.stats && (
          (() => {
            const visible = (Object.entries(listing.stats) as [keyof ItemStats, number][])
              .filter(([k, v]) => v > 0 || k === "availableSlots");
            return visible.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {visible.map(([key, val]) => (
                  <span
                    key={key}
                    className="text-[11px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-200 font-medium"
                  >
                    {statLabels[key]} {key === "availableSlots" ? val : `+${val}`}
                  </span>
                ))}
              </div>
            ) : null;
          })()
        )}
      </div>

      {/* User footer */}
      <div className="px-4 pb-4 pt-2 border-t border-maple-border/50">
        <ProfileBadge
          email={listing.userEmail}
          username={listing.username}
          avatarUrl={listing.userAvatarUrl}
          subtitle={timeAgo}
          size="sm"
        />
      </div>
    </Link>
  );
};
