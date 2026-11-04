import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../../api/client';
import styled from 'styled-components';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    setUser({ username });
    return res;
  };

  const logout = async () => {
    try { await api.logout(); } catch { /* ignore */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

const Loading = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text_primary};
  background: ${({ theme }) => theme.bg};
`;

export function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading>Memeriksa sesi…</Loading>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}