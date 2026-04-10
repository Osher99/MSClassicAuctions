import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, getAllListings, updateUserStatus, adminDeleteListing, getAllReports, updateReportStatus } from "@/services";
import type { UserStatus, Report } from "@/types";
import toast from "react-hot-toast";

const ADMIN_USERS_KEY = ["admin", "users"];
const ADMIN_LISTINGS_KEY = ["admin", "listings"];

export const useAdminUsers = () =>
  useQuery({
    queryKey: ADMIN_USERS_KEY,
    queryFn: getAllUsers,
  });

export const useAdminListings = () =>
  useQuery({
    queryKey: ADMIN_LISTINGS_KEY,
    queryFn: getAllListings,
  });

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, status }: { uid: string; status: UserStatus }) =>
      updateUserStatus(uid, status),
    onSuccess: (deletedCount, { status }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
      if (status === "banned" && deletedCount > 0) {
        queryClient.invalidateQueries({ queryKey: ADMIN_LISTINGS_KEY });
        queryClient.invalidateQueries({ queryKey: ["listings"] });
        toast.success(`User banned & ${deletedCount} listing${deletedCount > 1 ? "s" : ""} removed`);
      } else {
        toast.success("User status updated");
      }
    },
    onError: () => {
      toast.error("Failed to update user status");
    },
  });
};

export const useAdminDeleteListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_LISTINGS_KEY });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing removed");
    },
    onError: () => {
      toast.error("Failed to remove listing");
    },
  });
};

const ADMIN_REPORTS_KEY = ["admin", "reports"];

export const useAdminReports = () =>
  useQuery({
    queryKey: ADMIN_REPORTS_KEY,
    queryFn: getAllReports,
  });

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: Report["status"] }) =>
      updateReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_KEY });
      toast.success("Report status updated");
    },
    onError: () => {
      toast.error("Failed to update report");
    },
  });
};
