import { useState, useEffect, useCallback } from "react";
import { authAPI } from "@/lib/api";

interface Admin {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("yogiraj_token");
    const stored = sessionStorage.getItem("yogiraj_admin");
    if (token && stored) {
      try {
        setAdmin(JSON.parse(stored));
        setIsLoggedIn(true);
      } catch {
        sessionStorage.removeItem("yogiraj_token");
        sessionStorage.removeItem("yogiraj_admin");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const { token, data } = res.data;
    sessionStorage.setItem("yogiraj_token", token);
    sessionStorage.setItem("yogiraj_admin", JSON.stringify(data));
    setAdmin(data);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("yogiraj_token");
    sessionStorage.removeItem("yogiraj_admin");
    setAdmin(null);
    setIsLoggedIn(false);
  }, []);

  return { admin, isLoggedIn, loading, login, logout };
};
