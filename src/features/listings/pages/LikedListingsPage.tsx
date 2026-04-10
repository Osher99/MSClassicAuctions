import { PageHeader, Spinner, EmptyState } from "@/components/ui";
import { useAuth } from "@/features/auth";
import { useListings } from "../hooks/useListings";
import { ListingGrid } from "../components/ListingGrid";
import { useQuery } from "@tanstack/react-query";
import { hasUserLiked } from "@/services";

export const LikedListingsPage = () => {
  const { user } = useAuth();
  const { data: listings, isLoading: listingsLoading } = useListings();

  const { data: likedListings = [], isLoading: likedLoading } = useQuery({
    queryKey: ["liked-listings", user?.uid, listings?.map((listing) => listing.id).join(",")],
    queryFn: async () => {
      if (!user || !listings) return [];

      const likedResults = await Promise.all(
        listings.map(async (listing) => ({
          listing,
          liked: await hasUserLiked(listing.id, user.uid),
        }))
      );

      return likedResults
        .filter((result) => result.liked)
        .map((result) => result.listing);
    },
    enabled: !!user && !!listings,
  });

  if (listingsLoading || likedLoading) {
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
