import { useState, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, createUserProfile } from "@/services";
import { getRandomAvatar } from "@/constants";
import toast from "react-hot-toast";

export const useRegisterForm = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [ign, setIgn] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(() => getRandomAvatar());
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!username.trim()) {
        toast.error("Username is required");
        return;
      }
      if (password !== confirm) {
        toast.error("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      setLoading(true);
      try {
        const cred = await signUp(email, password);
        await createUserProfile({
          uid: cred.user.uid,
          email,
          username: username.trim(),
          avatarUrl,
          ign: ign.trim(),
          createdAt: Date.now(),
        });
        toast.success("Account created! Check your email to verify your account.");
        navigate("/verify-email");
      } catch {
        toast.error("Failed to create account. Email may already be in use.");
      } finally {
        setLoading(false);
      }
    },
    [email, username, ign, avatarUrl, password, confirm, navigate]
  );

  return {
    email,
    setEmail,
    username,
    setUsername,
    ign,
    setIgn,
    avatarUrl,
    setAvatarUrl,
    password,
    setPassword,
    confirm,
    setConfirm,
    loading,
    handleSubmit,
  };
}
