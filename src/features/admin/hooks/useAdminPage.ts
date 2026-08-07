import { useState, useCallback } from "react";
import {
  useAdminUsers,
  useAdminListings,
  useUpdateUserStatus,
  useAdminDeleteListing,
  useAdminReports,
  useUpdateReportStatus,
} from "./useAdmin";
import type { UserStatus, Report } from "@/types";

export type AdminTab = "users" | "listings" | "reports";

export const useAdminPage = () => {
  const [tab, setTab] = useState<AdminTab>("users");
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: listings, isLoading: listingsLoading } = useAdminListings();
  const { data: reports, isLoading: reportsLoading } = useAdminReports();
  const updateStatus = useUpdateUserStatus();
  const deleteListing = useAdminDeleteListing();
  const updateReport = useUpdateReportStatus();

  const handleStatusChange = useCallback(
    (uid: string, status: UserStatus) => {
      const label = status === "banned" ? "ban" : status === "suspended" ? "suspend" : "activate";
      if (!window.confirm(`Are you sure you want to ${label} this user?`)) return;
      updateStatus.mutate({ uid, status });
    },
    [updateStatus]
  );

  const handleDeleteListing = useCallback(
    (id: string) => {
      if (!window.confirm("Are you sure you want to remove this listing?")) return;
      deleteListing.mutate(id);
    },
    [deleteListing]
  );

  const handleReportStatusChange = useCallback(
    (reportId: string, status: Report["status"]) => {
      updateReport.mutate({ reportId, status });
    },
    [updateReport]
  );

  const pendingReportsCount = reports?.filter((r) => r.status === "pending").length ?? 0;

  return {
    tab,
    setTab,
    users,
    usersLoading,
    listings,
    listingsLoading,
    reports,
    reportsLoading,
    handleStatusChange,
    handleDeleteListing,
    handleReportStatusChange,
    pendingReportsCount,
  };
};
