import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import api, { session } from "api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(session.user);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/users/login", { email, password });
    session.save(data);
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/users/register", { name, email, password });
    session.save(data);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const { data } = await api.put("/users/me", patch);
    const merged = { ...session.user, ...data };
    session.save(merged);
    setUser(merged);
    return merged;
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("nf:logout", onLogout);
    return () => window.removeEventListener("nf:logout", onLogout);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout, updateProfile }),
    [user, login, register, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export const useAuth = () => useContext(AuthContext);
