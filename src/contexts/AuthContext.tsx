import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setTokens, clearTokens } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; username: string; email: string; password: string; city: string }) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("squad_access_token");
      if (!token) { setLoading(false); return; }
      const data = await api<User>("/api/auth/me");
      setUser(data);
      connectSocket();
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const data = await api<{ user: User; accessToken: string; refreshToken: string }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    connectSocket();
  };

  const register = async (regData: { name: string; username: string; email: string; password: string; city: string }) => {
    const data = await api<{ user: User; accessToken: string; refreshToken: string }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(regData) }
    );
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    connectSocket();
  };

  const logout = async () => {
    try {
      const rt = localStorage.getItem("squad_refresh_token");
      await api("/api/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: rt }) });
    } catch { /* ignore */ }
    clearTokens();
    disconnectSocket();
    setUser(null);
  };

  const deleteAccount = async () => {
    await api("/api/auth/me", { method: "DELETE" });
    clearTokens();
    disconnectSocket();
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator" || isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount, refreshUser: fetchUser, isAdmin, isModerator }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
