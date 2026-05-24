import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("niyalgpt_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("niyalgpt_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function authenticate(mode, payload) {
    const { data } = await api.post(`/auth/${mode}`, payload);
    localStorage.setItem("niyalgpt_token", data.token);
    localStorage.setItem("niyalgpt_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("niyalgpt_token");
    localStorage.removeItem("niyalgpt_user");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), authenticate, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
