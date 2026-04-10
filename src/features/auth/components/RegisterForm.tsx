import { Link } from "react-router-dom";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { AVATAR_OPTIONS } from "@/constants";
import { Button, Input, Card } from "@/components/ui";

export const RegisterForm = () => {
  const {
    email, setEmail,
    username, setUsername,
    ign, setIgn,
    avatarUrl, setAvatarUrl,
    password, setPassword,
    confirm, setConfirm,
    loading,
    handleSubmit,
  } = useRegisterForm();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-maple-gold flex items-center justify-center gap-2"><img src="/assets/maple-icon.png" alt="" className="w-8 h-8" /> Register</h1>
          <p className="text-slate-400 mt-2">
            Join the MapleStory marketplace
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="adventurer@maple.com"
            required
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your display name on the site"
            required
          />
          <Input
            label="IGN (In-Game Name)"
            value={ign}
            onChange={(e) => setIgn(e.target.value)}
            placeholder="Optional — your MapleStory character name"
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

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <p className="mt-1.5 text-xs text-amber-400/80 flex items-center gap-1">
              <span>⚠️</span> Do not use your MapleStory password here. Use a unique password for this site.
            </p>
          </div>
          <Input
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>
        <p className="text-center text-slate-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-maple-orange hover:text-maple-gold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
