import { useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useListing, useUpdateListing } from "./useListings";
import type { ListingFormData } from "@/types";
import toast from "react-hot-toast";
import { deleteListingImage, uploadListingImage } from "@/services";

export const useEditListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(id!);
  const updateMutation = useUpdateListing();

  const handleSubmit = useCallback(
    async (data: ListingFormData, listingImageFile?: File | null, removeListingImage?: boolean) => {
      if (!listing || !user) return;
      if (profile?.status === "suspended") {
        toast.error("Your account is suspended. You cannot edit listings.");
        return;
      }

      let uploadedImage:
        | {
            url: string;
            path: string;
          }
        | undefined;

      try {
        if (listingImageFile) {
          uploadedImage = await uploadListingImage(listingImageFile, user.uid);
        }

        await updateMutation.mutateAsync({
          id: listing.id,
          data: {
            ...data,
            listingImageUrl: removeListingImage
              ? undefined
              : uploadedImage?.url ?? data.listingImageUrl,
            listingImagePath: removeListingImage
              ? undefined
              : uploadedImage?.path ?? data.listingImagePath,
          },
        });

        if ((listingImageFile || removeListingImage) && listing.listingImagePath) {
          await deleteListingImage(listing.listingImagePath).catch(() => undefined);
        }
      } catch (error) {
        if (uploadedImage?.path) {
          await deleteListingImage(uploadedImage.path).catch(() => undefined);
        }
        if (error instanceof Error) {
          toast.error(error.message, { duration: 6000 });
        }
        return;
      }

      navigate("/my-listings");
    },
    [listing, user, profile, updateMutation, navigate]
  );

  const initialData = useMemo<ListingFormData | undefined>(() => {
    if (!listing) return undefined;
    const { id, userId, userEmail, username, userAvatarUrl, createdAt, expiresAt, isActive, ...data } = listing;
    return data;
  }, [listing]);

  const isOwner = listing?.userId === user?.uid;

  return {
    listing,
    isLoading,
    isOwner,
    initialData,
    handleSubmit,
    isPending: updateMutation.isPending,
  };
}
