/**
 * AuthContext — Assigned to: Hamzat Olajuwon (@juwonabdullahi007-arc)
 *
 * TODO: Implement authentication context:
 *   - user state (null when logged out)
 *   - login(email, password) — call api login, store token, set user
 *   - register(username, email, password) — call api register, store token
 *   - logout() — clear token, set user null
 *   - loading state for initial token check
 *
 * Hint: On mount, call getMe() if token exists in localStorage to rehydrate user
 */
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading] = useState(false);

  // TODO: implement login, register, logout
  const login = async () => { throw new Error('TODO: implement login') };
  const register = async () => { throw new Error('TODO: implement register') };
  const logout = () => { localStorage.removeItem('mv_token'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
