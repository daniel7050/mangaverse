import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('mv_token');
    if (!token) { setLoading(false); return; }
    getMe()
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('mv_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem('mv_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (username, email, password) => {
    const res = await apiRegister({ username, email, password });
    localStorage.setItem('mv_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('mv_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
