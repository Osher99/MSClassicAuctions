import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useListing, useDeleteListing } from "./useListings";

export const useListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(id!);
  const deleteMutation = useDeleteListing();

  const isOwner = user?.uid === listing?.userId;

  const handleDelete = useCallback(async () => {
    if (!listing || !window.confirm("Are you sure you want to delete this listing?")) return;
    await deleteMutation.mutateAsync(listing.id);
    navigate("/my-listings");
  }, [listing, deleteMutation, navigate]);

  const activeStats = listing?.stats
    ? Object.entries(listing.stats).filter(
        ([key, val]) => val > 0 && key !== "availableSlots"
      )
    : [];

  return {
    listing,
    isLoading,
    isOwner,
    activeStats,
    handleDelete,
    isDeleting: deleteMutation.isPending,
  };
}
