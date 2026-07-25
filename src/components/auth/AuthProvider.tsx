"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  adminLoginRequest,
  clearAuthSession,
  fetchMe,
  getAccessToken,
  getStoredUser,
  loginRequest,
  setAuthSession,
  signupRequest,
  type AuthUser,
} from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  adminLogin: (email: string, password: string) => Promise<AuthUser>;
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    company?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUserProfile: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetchMe();
      setUser(res.data);
      setAuthSession(token, res.data);
    } catch {
      clearAuthSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getStoredUser();
    if (cached && getAccessToken()) {
      setUser(cached);
    }
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    setAuthSession(res.data.accessToken, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    const res = await adminLoginRequest(email, password);
    setAuthSession(res.data.accessToken, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const signup = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      company?: string;
    }) => {
      const res = await signupRequest(payload);
      setAuthSession(res.data.accessToken, res.data.user);
      setUser(res.data.user);
      return res.data.user;
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const setUserProfile = useCallback((next: AuthUser) => {
    const token = getAccessToken();
    if (token) setAuthSession(token, next);
    else localStorage.setItem("printoe_user", JSON.stringify(next));
    setUser(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && getAccessToken()),
      isAdmin: user?.role === "ADMIN",
      login,
      adminLogin,
      signup,
      logout,
      refresh,
      setUserProfile,
    }),
    [user, loading, login, adminLogin, signup, logout, refresh, setUserProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
