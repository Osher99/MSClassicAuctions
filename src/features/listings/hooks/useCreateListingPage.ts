import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useCreateListing } from "./useListings";
import type { ListingFormData } from "@/types";
import toast from "react-hot-toast";
import { deleteListingImage, uploadListingImage } from "@/services";

export const useCreateListingPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const createMutation = useCreateListing();

  const handleSubmit = useCallback(
    async (data: ListingFormData, listingImageFile?: File | null) => {
      if (!user) return;
      if (profile?.status === "suspended") {
        toast.error("Your account is suspended. You cannot create listings.");
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

        await createMutation.mutateAsync({
          data: {
            ...data,
            listingImageUrl: uploadedImage?.url,
            listingImagePath: uploadedImage?.path,
          },
          userId: user.uid,
          userEmail: user.email ?? "",
          username: profile?.username ?? "",
          userAvatarUrl: profile?.avatarUrl ?? "",
        });
        navigate("/my-listings");
      } catch (error) {
        if (uploadedImage?.path) {
          await deleteListingImage(uploadedImage.path).catch(() => undefined);
        }
        if (error instanceof Error) {
          toast.error(error.message, { duration: 6000 });
        }
      }
    },
    [user, profile, createMutation, navigate]
  );

  return {
    handleSubmit,
    isPending: createMutation.isPending,
  };
}
