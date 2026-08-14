"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getMe, logoutBackend } from "@/lib/auth";

type User = {
  username: string;
  role: string;
} | null;

type AuthContextType = {
  isAuthenticated: boolean;
  user: User;
  isLoading: boolean; // Prevents UI flashing while checking the cookie on first load
  login: () => Promise<void>; 
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Checks the backend for a valid cookie session
  const refreshSession = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Run once when the app starts
  useEffect(() => {
    refreshSession();
  }, []);

  // Your Login page will call this AFTER `loginUser` successfully returns
  const login = async () => {
    await refreshSession();
  };

  // Kills the cookie on the backend, then clears local state
  const logout = async () => {
    try {
      await logoutBackend();
    } catch (e) {
      console.error("Backend logout failed, clearing local state anyway", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}