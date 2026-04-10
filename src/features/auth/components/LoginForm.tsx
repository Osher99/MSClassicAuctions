import { Link } from "react-router-dom";
import { useLoginForm } from "../hooks/useLoginForm";
import { Button, Input, Card } from "@/components/ui";

export const LoginForm = () => {
  const { email, setEmail, password, setPassword, loading, resetLoading, handleSubmit, handleForgotPassword } =
    useLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-maple-gold flex items-center justify-center gap-2"><img src="/assets/maple-icon.png" alt="" className="w-8 h-8" /> Login</h1>
          <p className="text-slate-400 mt-2">
            Sign in to MapleStory Classic Marketplace
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
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div className="flex justify-end -mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-sm text-maple-orange hover:text-maple-gold transition-colors disabled:opacity-50"
            >
              {resetLoading ? "Sending..." : "Forgot password?"}
            </button>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>
        <p className="text-center text-slate-400 mt-6 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-maple-orange hover:text-maple-gold transition-colors"
          >
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
}
