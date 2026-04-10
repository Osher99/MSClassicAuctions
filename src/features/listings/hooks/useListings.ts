import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getListings,
  getListingById,
  getUserListings,
  createListing,
  updateListing,
  reactivateListing,
  deleteListing,
} from "@/services";
import type { ListingFormData } from "@/types";
import toast from "react-hot-toast";

const LISTINGS_KEY = ["listings"];

const getListingMutationErrorMessage = (err: Error, fallback: string) => {
  if (err.message === "MAX_LISTINGS_REACHED") {
    return "Hey! You already maxed on listings! Either delete a listing or wait for one to expire.";
  }

  return err.message || fallback;
};

export const useListings = () => {
  return useQuery({
    queryKey: LISTINGS_KEY,
    queryFn: getListings,
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: [...LISTINGS_KEY, id],
    queryFn: () => getListingById(id),
    enabled: !!id,
  });
};

export const useUserListings = (userId: string | undefined) => {
  return useQuery({
    queryKey: [...LISTINGS_KEY, "user", userId],
    queryFn: () => getUserListings(userId!),
    enabled: !!userId,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      userId,
      userEmail,
      username,
      userAvatarUrl,
    }: {
      data: ListingFormData;
      userId: string;
      userEmail: string;
      username: string;
      userAvatarUrl: string;
    }) => createListing(data, userId, userEmail, username, userAvatarUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
      toast.success("Listing created! It will be active for 7 days.");
    },
    onError: (err: Error) => {
      toast.error(getListingMutationErrorMessage(err, "Failed to create listing"), { duration: 5000 });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ListingFormData> }) =>
      updateListing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
      toast.success("Listing updated!");
    },
    onError: () => {
      toast.error("Failed to update listing");
    },
  });
};

export const useReactivateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      reactivateListing(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
      toast.success("Listing reactivated for another 7 days!");
    },
    onError: (err: Error) => {
      toast.error(getListingMutationErrorMessage(err, "Failed to reactivate listing"), { duration: 5000 });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTINGS_KEY });
      toast.success("Listing deleted");
    },
    onError: () => {
      toast.error("Failed to delete listing");
    },
  });
}
