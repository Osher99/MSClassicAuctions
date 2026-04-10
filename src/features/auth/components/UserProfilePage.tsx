import { useUserProfileForm } from "../hooks/useUserProfileForm";
import { AVATAR_OPTIONS } from "@/constants";
import { Button, Input, Card, PageHeader, Spinner } from "@/components/ui";

export const UserProfilePage = () => {
  const {
    profile,
    ign, setIgn,
    avatarUrl, setAvatarUrl,
    loading,
    handleSaveProfile,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    passwordLoading,
    handleChangePassword,
  } = useUserProfileForm();

  if (!profile) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="⚙️ My Profile" subtitle="Manage your account settings" />

      {/* Account Info (read-only) */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">👤 Account Info</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
            <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-maple-border text-slate-300 text-sm">
              {profile.username}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Username cannot be changed</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
            <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-maple-border text-slate-300 text-sm">
              {profile.email}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </Card>

      {/* IGN + Avatar (editable) */}
      <Card>
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <h2 className="text-lg font-semibold text-white">🎮 Game Profile</h2>

          {/* Current Avatar Preview */}
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl}
              alt="Your avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-maple-orange ring-2 ring-maple-orange/30"
            />
            <div>
              <p className="text-white font-bold text-lg">{profile.username}</p>
              {profile.ign && (
                <p className="text-sm text-slate-400">IGN: {profile.ign}</p>
              )}
            </div>
          </div>

          <Input
            label="IGN (In-Game Name)"
            value={ign}
            onChange={(e) => setIgn(e.target.value)}
            placeholder="Your MapleStory character name"
          />

          {/* Avatar Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Choose Your Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    avatarUrl === url
                      ? "border-maple-orange ring-2 ring-maple-orange/50 scale-105"
                      : "border-maple-border hover:border-slate-500"
                  }`}
                >
                  <img
                    src={url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <form onSubmit={handleChangePassword} className="space-y-5">
          <h2 className="text-lg font-semibold text-white">🔒 Change Password</h2>

          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            required
          />

          <Button type="submit" loading={passwordLoading} variant="secondary" className="w-full">
            Change Password
          </Button>
        </form>
      </Card>
    </div>
  );
};
