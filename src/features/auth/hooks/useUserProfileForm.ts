import { useState, useCallback, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile, changePassword, getUserListings, backfillListingProfile } from "@/services";
import toast from "react-hot-toast";

export const useUserProfileForm = () => {
  const { profile, refreshProfile } = useAuth();
  const [ign, setIgn] = useState(profile?.ign ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [loading, setLoading] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveProfile = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!profile) return;
      setLoading(true);
      try {
        await updateUserProfile(profile.uid, {
          avatarUrl,
          ign: ign.trim(),
        });
        await refreshProfile();

        // Backfill all user listings with new profile data
        const listings = await getUserListings(profile.uid);
        const stale = listings.filter(
          (l) => l.username !== profile.username || l.userAvatarUrl !== avatarUrl
        );
        await Promise.all(
          stale.map((l) => backfillListingProfile(l.id, profile.username, avatarUrl))
        );

        toast.success("Profile updated!");
      } catch {
        toast.error("Failed to update profile");
      } finally {
        setLoading(false);
      }
    },
    [ign, avatarUrl, profile, refreshProfile]
  );

  const handleChangePassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      setPasswordLoading(true);
      try {
        await changePassword(currentPassword, newPassword);
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch {
        toast.error("Failed to change password. Check your current password.");
      } finally {
        setPasswordLoading(false);
      }
    },
    [currentPassword, newPassword, confirmPassword]
  );

  return {
    profile,
    ign,
    setIgn,
    avatarUrl,
    setAvatarUrl,
    loading,
    handleSaveProfile,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordLoading,
    handleChangePassword,
  };
}
