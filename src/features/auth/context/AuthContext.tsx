import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import type { UserProfile } from "@/types";
import { onAuthChange, getUserProfile, createUserProfile, logOut } from "@/services";
import { getRandomAvatar } from "@/constants";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User | null) => {
    if (u) {
      let p = await getUserProfile(u.uid);
      if (!p) {
        // Auto-create profile for users registered before profile system
        p = {
          uid: u.uid,
          email: u.email ?? "",
          username: u.email?.split("@")[0] ?? "User",
          avatarUrl: getRandomAvatar(),
          createdAt: Date.now(),
        };
        await createUserProfile(p);
      }
      setProfile(p);
      // Banned users get logged out immediately
      if (p.status === "banned") {
        await logOut();
        setUser(null);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      await loadProfile(u);
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
