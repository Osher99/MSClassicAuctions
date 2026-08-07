import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { useListings } from "./useListings";
import { hasUserLiked } from "@/services";

export const useLikedListingsPage = () => {
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

  return {
    likedListings,
    isLoading: listingsLoading || likedLoading,
  };
};
