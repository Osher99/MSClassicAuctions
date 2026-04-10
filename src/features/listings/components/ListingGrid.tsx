import type { Listing } from "@/types";
import { EmptyState } from "@/components/ui";
import { ListingCard } from "./ListingCard";

interface ListingGridProps {
  listings: Listing[];
}

export const ListingGrid = ({ listings }: ListingGridProps) =>
  listings.length === 0 ? (
    <EmptyState
      icon="🛒"
      title="No listings found"
      subtitle="Check back later or create a new listing!"
    />
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
