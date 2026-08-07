import { PageHeader, Spinner, EmptyState } from "@/components/ui";
import { useLikedListingsPage } from "../hooks/useLikedListingsPage";
import { ListingGrid } from "../components/ListingGrid";

export const LikedListingsPage = () => {
  const { likedListings, isLoading } = useLikedListingsPage();

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader
        icon={<img src="/assets/maple-icon.png" alt="" className="w-8 h-8" />}
        title="Liked Listings"
        subtitle="All listings you have liked"
      />

      {likedListings.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="No liked listings yet"
          subtitle="Tap the heart on listings you like, and they will appear here."
        />
      ) : (
        <ListingGrid listings={likedListings} />
      )}
    </div>
  );
};
