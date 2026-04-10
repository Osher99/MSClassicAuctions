import { useState, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, getUserProfile, logOut, resetPassword } from "@/services";
import toast from "react-hot-toast";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const cred = await signIn(email, password);
        const profile = await getUserProfile(cred.user.uid);
        if (profile?.status === "banned") {
          await logOut();
          toast.error("Your account has been banned.");
          return;
        }
        toast.success("Welcome back!");
        navigate("/");
      } catch {
        toast.error("Invalid email or password");
      } finally {
        setLoading(false);
      }
    },
    [email, password, navigate]
  );

  const handleForgotPassword = useCallback(async () => {
    if (!email.trim()) {
      toast.error("Enter your email address first");
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch {
      toast.error("Failed to send reset email. Check your email address.");
    } finally {
      setResetLoading(false);
    }
  }, [email]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    resetLoading,
    handleSubmit,
    handleForgotPassword,
  };
}
