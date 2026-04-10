import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resendVerificationEmail, logOut } from "@/services";
import { Button, Card } from "@/components/ui";
import toast from "react-hot-toast";

export const VerifyEmailPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);

  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to send verification email. Try again later.");
    } finally {
      setResending(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!user) return;
    await user.reload();
    if (user.emailVerified) {
      toast.success("Email verified! Welcome to MapleStory Auctions!");
      navigate("/");
    } else {
      toast("Email not verified yet. Check your inbox.", { icon: "📧" });
    }
  }, [user, navigate]);

  const handleLogout = useCallback(async () => {
    await logOut();
    navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Verify Your Email
        </h1>
        <p className="text-slate-400 mb-1">
          We sent a verification link to:
        </p>
        <p className="text-maple-orange font-semibold mb-6">
          {user?.email ?? "your email"}
        </p>
        <p className="text-slate-400 text-sm mb-6">
          Click the link in the email to verify your account, then come back here and press the button below.
        </p>
        <p className="text-amber-400/80 text-xs mb-6 flex items-center justify-center gap-1">
          <span>⚠️</span> Can't find it? Check your <strong>spam / junk</strong> folder!
        </p>

        <div className="space-y-3">
          <Button onClick={handleRefresh} className="w-full">
            ✅ I've Verified — Let Me In
          </Button>
          <Button
            variant="secondary"
            onClick={handleResend}
            loading={resending}
            className="w-full"
          >
            📩 Resend Verification Email
          </Button>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Sign out and use a different email
          </button>
        </div>
      </Card>
    </div>
  );
};
