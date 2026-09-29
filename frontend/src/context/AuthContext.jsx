/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getCurrentUser, login as loginRequest, signup as signupRequest } from '../services/AuthService';

const AuthContext = createContext(null);

function readStoredUser() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(() => typeof window !== 'undefined' && Boolean(localStorage.getItem('token')));
  const sessionVersion = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const version = sessionVersion.current;
    if (!token) return undefined;

    let active = true;
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (!active || sessionVersion.current !== version) return;
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        if (!active || sessionVersion.current !== version) return;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => {
        if (active && sessionVersion.current === version) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);
    sessionVersion.current += 1;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setLoading(false);
    return data;
  }, []);

  const signup = useCallback(async (details) => {
    const data = await signupRequest(details);
    return data;
  }, []);

  const completeSocialLogin = useCallback((data) => {
    sessionVersion.current += 1;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    sessionVersion.current += 1;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, completeSocialLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
