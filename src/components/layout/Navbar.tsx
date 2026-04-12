import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useUnreadCount } from "@/features/chat";
import { logOut } from "@/services";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = useUnreadCount();

  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const baseTitle = "MS Classic Marketplace";
    if (user && unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
      return;
    }
    document.title = baseTitle;
  }, [user, unreadCount]);

  const handleLogout = useCallback(async () => {
    await logOut();
    toast.success("Logged out");
    closeMobile();
    navigate("/");
  }, [navigate, closeMobile]);

  return (
    <nav className="sticky top-0 z-50 bg-maple-dark/80 backdrop-blur-md border-b border-maple-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/assets/free-market-logo.png" alt="Free Market Logo" className="w-10 h-10" />
            <span className="font-bold text-lg text-white group-hover:text-maple-orange transition-colors hidden sm:inline">
              MapleStory Classic Marketplace
            </span>
            <span className="font-bold text-lg text-white group-hover:text-maple-orange transition-colors sm:hidden">
              MS Classic Marketplace
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/liked-listings">
                  <Button variant="secondary" size="sm">Liked Listings</Button>
                </Link>
                <Link to="/my-listings">
                  <Button variant="secondary" size="sm">My Listings</Button>
                </Link>
                <Link to="/chats" className="relative">
                  <Button variant="secondary" size="sm">
                    💬 Messages
                  </Button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 pointer-events-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/listings/new">
                  <Button size="sm">+ New Listing</Button>
                </Link>
                {profile?.role === "admin" && (
                  <Link to="/admin">
                    <Button variant="secondary" size="sm" className="!text-red-400 !border-red-400/30 hover:!bg-red-400/10">
                      🛡️ Admin
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-3 ml-2">
                  <Link to="/profile" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-700/50 transition-colors">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-maple-border" />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-maple-orange/20 flex items-center justify-center text-xs text-maple-orange font-bold">
                        {(profile?.username || user.email || "?")[0].toUpperCase()}
                      </span>
                    )}
                    <span className="text-xs text-slate-300 max-w-[120px] truncate">
                      {profile?.username || user.email}
                    </span>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={toggleMobile}
            className="md:hidden p-2 text-slate-300 hover:text-white relative"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
            {user && unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 z-10 flex items-center justify-center">
                <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-500/75 animate-ping" />
                <span className="relative bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 inline-flex items-center justify-center px-1 ring-2 ring-maple-dark">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-maple-border bg-maple-dark/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link
                  to="/liked-listings"
                  onClick={closeMobile}
                  className="block"
                >
                  <Button variant="secondary" className="w-full">Liked Listings</Button>
                </Link>
                <Link
                  to="/my-listings"
                  onClick={closeMobile}
                  className="block"
                >
                  <Button variant="secondary" className="w-full">My Listings</Button>
                </Link>
                <Link
                  to="/chats"
                  onClick={closeMobile}
                  className="block relative"
                >
                  <Button variant="secondary" className="w-full">
                    💬 Messages
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center px-1">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link
                  to="/listings/new"
                  onClick={closeMobile}
                  className="block"
                >
                  <Button className="w-full">+ New Listing</Button>
                </Link>
                {profile?.role === "admin" && (
                  <Link to="/admin" onClick={closeMobile} className="block">
                    <Button variant="secondary" className="w-full !text-red-400 !border-red-400/30 hover:!bg-red-400/10">
                      🛡️ Admin Panel
                    </Button>
                  </Link>
                )}
                <div className="pt-2 border-t border-maple-border">
                  <Link
                    to="/profile"
                    onClick={closeMobile}
                    className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-maple-border" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-maple-orange/20 flex items-center justify-center text-sm text-maple-orange font-bold">
                        {(profile?.username || user.email || "?")[0].toUpperCase()}
                      </span>
                    )}
                    <span className="text-sm text-slate-300">
                      {profile?.username || user.email}
                    </span>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-maple-border">
                <Link to="/login" className="flex-1" onClick={closeMobile}>
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={closeMobile}>
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
