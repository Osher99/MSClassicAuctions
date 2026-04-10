import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAdminUsers, useAdminListings, useUpdateUserStatus, useAdminDeleteListing, useAdminReports, useUpdateReportStatus } from "../hooks/useAdmin";
import { PageHeader, Card, Button, Spinner, Badge } from "@/components/ui";
import type { UserProfile, Listing, UserStatus, Report } from "@/types";

type Tab = "users" | "listings" | "reports";

const reportStatusColors: Record<string, "orange" | "green" | "purple"> = {
  pending: "orange",
  reviewed: "green",
  dismissed: "purple",
};

const ReportRow = ({ report, onStatusChange }: { report: Report; onStatusChange: (id: string, status: Report["status"]) => void }) => (
  <tr className="border-b border-maple-border/50 hover:bg-maple-dark/30 transition-colors">
    <td className="px-4 py-3">
      <div className="text-sm font-medium text-white">{report.reporterUsername}</div>
      <div className="text-xs text-slate-400">reported</div>
      <div className="text-sm font-medium text-red-400">{report.reportedUsername}</div>
    </td>
    <td className="px-4 py-3 text-sm text-slate-300 max-w-xs">
      <p className="whitespace-pre-wrap break-words">{report.reason}</p>
    </td>
    <td className="px-4 py-3 text-sm">
      <Link to={`/chats/${report.conversationId}`} className="text-maple-orange hover:text-maple-gold transition-colors underline">
        View Chat
      </Link>
    </td>
    <td className="px-4 py-3">
      <Badge variant={reportStatusColors[report.status]} size="sm">
        {report.status.toUpperCase()}
      </Badge>
    </td>
    <td className="px-4 py-3 text-sm text-slate-400">
      {report.createdAt?.toDate().toLocaleDateString()}
    </td>
    <td className="px-4 py-3">
      {report.status === "pending" && (
        <div className="flex gap-1">
          <Button variant="secondary" size="sm" onClick={() => onStatusChange(report.id, "reviewed")} className="!text-green-400 !border-green-400/30 hover:!bg-green-400/10">
            Reviewed
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onStatusChange(report.id, "dismissed")} className="!text-slate-400 !border-slate-400/30 hover:!bg-slate-400/10">
            Dismiss
          </Button>
        </div>
      )}
    </td>
  </tr>
);

const statusColors: Record<string, "green" | "orange" | "purple"> = {
  active: "green",
  suspended: "orange",
  banned: "purple",
};

const UserRow = ({ user, onStatusChange }: { user: UserProfile; onStatusChange: (uid: string, status: UserStatus) => void }) => (
  <tr className="border-b border-maple-border/50 hover:bg-maple-dark/30 transition-colors">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-maple-border" />
        <div>
          <div className="text-sm font-medium text-white">{user.username}</div>
          <div className="text-xs text-slate-400">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="px-4 py-3 text-sm text-slate-300">{user.ign || "—"}</td>
    <td className="px-4 py-3 text-sm text-slate-300">
      <Badge variant={statusColors[user.status || "active"]} size="sm">
        {(user.status || "active").toUpperCase()}
      </Badge>
    </td>
    <td className="px-4 py-3 text-sm text-slate-400">
      {user.role === "admin" ? (
        <Badge variant="gold" size="sm">ADMIN</Badge>
      ) : (
        "User"
      )}
    </td>
    <td className="px-4 py-3 text-sm text-slate-400">
      {new Date(user.createdAt).toLocaleDateString()}
    </td>
    <td className="px-4 py-3">
      {user.role !== "admin" && (
        <div className="flex gap-1">
          {(user.status || "active") !== "suspended" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange(user.uid, "suspended")}
            >
              Suspend
            </Button>
          )}
          {(user.status || "active") !== "banned" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange(user.uid, "banned")}
              className="!text-red-400 !border-red-400/30 hover:!bg-red-400/10"
            >
              Ban
            </Button>
          )}
          {(user.status || "active") !== "active" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange(user.uid, "active")}
              className="!text-green-400 !border-green-400/30 hover:!bg-green-400/10"
            >
              Activate
            </Button>
          )}
        </div>
      )}
    </td>
  </tr>
);

const ListingRow = ({ listing, onDelete }: { listing: Listing; onDelete: (id: string) => void }) => {
  const isExpired = listing.expiresAt && listing.expiresAt.toMillis() < Date.now();
  return (
    <tr className="border-b border-maple-border/50 hover:bg-maple-dark/30 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={listing.itemIconUrl} alt="" className="w-8 h-8 object-contain" />
          <div>
            <div className="text-sm font-medium text-white">{listing.itemName}</div>
            <div className="text-xs text-slate-400">{listing.server}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-maple-gold font-medium">
        {listing.price.toLocaleString()} mesos
      </td>
      <td className="px-4 py-3 text-sm text-slate-300">{listing.username || listing.userEmail}</td>
      <td className="px-4 py-3 text-sm">
        <Badge variant={isExpired ? "orange" : "green"} size="sm">
          {isExpired ? "EXPIRED" : "ACTIVE"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-slate-400">
        {listing.createdAt?.toDate().toLocaleDateString() ?? "—"}
      </td>
      <td className="px-4 py-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDelete(listing.id)}
          className="!text-red-400 !border-red-400/30 hover:!bg-red-400/10"
        >
          Remove
        </Button>
      </td>
    </tr>
  );
};

export const AdminPage = () => {
  const [tab, setTab] = useState<Tab>("users");
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

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="🛡️ Admin Panel"
        subtitle="Manage users and listings"
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-maple-card rounded-xl p-1 border border-maple-border w-fit">
        <button
          onClick={() => setTab("users")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "users"
              ? "bg-maple-orange text-white"
              : "text-slate-400 hover:text-white hover:bg-maple-dark/50"
          }`}
        >
          Users {users && <span className="ml-1 text-xs opacity-75">({users.length})</span>}
        </button>
        <button
          onClick={() => setTab("listings")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "listings"
              ? "bg-maple-orange text-white"
              : "text-slate-400 hover:text-white hover:bg-maple-dark/50"
          }`}
        >
          Listings {listings && <span className="ml-1 text-xs opacity-75">({listings.length})</span>}
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors relative ${
            tab === "reports"
              ? "bg-maple-orange text-white"
              : "text-slate-400 hover:text-white hover:bg-maple-dark/50"
          }`}
        >
          Reports {reports && <span className="ml-1 text-xs opacity-75">({reports.length})</span>}
          {pendingReportsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {pendingReportsCount}
            </span>
          )}
        </button>
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <Card padding="none">
          {usersLoading ? (
            <div className="p-12"><Spinner /></div>
          ) : !users?.length ? (
            <p className="text-slate-400 text-center p-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-maple-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">IGN</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <UserRow key={u.uid} user={u} onStatusChange={handleStatusChange} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Listings Tab */}
      {tab === "listings" && (
        <Card padding="none">
          {listingsLoading ? (
            <div className="p-12"><Spinner /></div>
          ) : !listings?.length ? (
            <p className="text-slate-400 text-center p-8">No listings found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-maple-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Seller</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <ListingRow key={l.id} listing={l} onDelete={handleDeleteListing} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Reports Tab */}
      {tab === "reports" && (
        <Card padding="none">
          {reportsLoading ? (
            <div className="p-12"><Spinner /></div>
          ) : !reports?.length ? (
            <p className="text-slate-400 text-center p-8">No reports found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-maple-border text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Users</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Chat</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <ReportRow key={r.id} report={r} onStatusChange={handleReportStatusChange} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
