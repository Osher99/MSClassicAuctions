import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/features/auth";
import { useUserListings, useDeleteListing, useReactivateListing } from "./useListings";
import { backfillListingProfile } from "@/services";
import type { Listing } from "@/types";

const isExpired = (listing: Pick<Listing, "isActive" | "expiresAt">) =>
  !listing.isActive || (listing.expiresAt && listing.expiresAt.toMillis() <= Date.now());

export const formatExpiry = (expiresAt: { toDate: () => Date }) => {
  const ms = expiresAt.toDate().getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
};

export const useMyListingsPage = () => {
  const { user, profile } = useAuth();
  const { data: listings, isLoading } = useUserListings(user?.uid);
  const deleteMutation = useDeleteListing();
  const reactivateMutation = useReactivateListing();
  const backfilledRef = useRef(false);

  // Backfill old listings that are missing username/avatar
  useEffect(() => {
    if (!listings || !profile || backfilledRef.current) return;
    backfilledRef.current = true;
    const stale = listings.filter(
      (l) => l.username !== profile.username || l.userAvatarUrl !== profile.avatarUrl
    );
    stale.forEach((l) =>
      backfillListingProfile(l.id, profile.username, profile.avatarUrl)
    );
  }, [listings, profile]);

  const { active, expired } = useMemo(() => {
    if (!listings) return { active: [] as Listing[], expired: [] as Listing[] };
    return {
      active: listings.filter((l) => !isExpired(l)),
      expired: listings.filter((l) => isExpired(l)),
    };
  }, [listings]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this listing?")) return;
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const handleReactivate = useCallback(
    async (id: string) => {
      if (!user) return;
      await reactivateMutation.mutateAsync({ id, userId: user.uid });
    },
    [user, reactivateMutation]
  );

  return {
    listings,
    isLoading,
    active,
    expired,
    handleDelete,
    handleReactivate,
    isDeleting: deleteMutation.isPending,
    isReactivating: reactivateMutation.isPending,
  };
}
