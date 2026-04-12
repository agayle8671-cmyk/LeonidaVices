import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import AuthModal from "../components/AuthModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
// Token key used in sessionStorage (sessionStorage clears on tab close, reducing XSS exposure vs localStorage)
const TOKEN_KEY = "hj_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUser(r.data))
        .catch(err => {
          console.error("Session validation failed:", err);
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { username, password });
    sessionStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, password, email = null) => {
    const { data } = await axios.post(`${API}/auth/register`, { username, password, email });
    sessionStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // State setters (setToken, setUser, setShowAuth) are stable React references — empty deps intentional
  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getHeaders = useCallback(() =>
    token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  const openAuth  = useCallback(() => setShowAuth(true),  []); // eslint-disable-line react-hooks/exhaustive-deps
  const closeAuth = useCallback(() => setShowAuth(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, getHeaders, openAuth }}>
      {children}
      {showAuth && <AuthModal onClose={closeAuth} />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
