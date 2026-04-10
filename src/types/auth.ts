export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended" | "banned";

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  avatarUrl: string;
  ign?: string;
  role?: UserRole;
  status?: UserStatus;
  createdAt: number;
}
