import { useEffect, useState, useRef } from 'react';
import api from './api';
import { parseJwt } from './utils';
import { AuthContext } from './context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem('token') || null
  );
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const refreshUser = async () => {
    try {
      const data = await api.request('/', { method: 'GET', token });
      if (data?.user) setUser(data.user);
      return data.user;
    } catch (e) {
      console.log('refreshUser failed:', e);
      return null;
    }
  };

  const logout = async () => {
    try {
      await api.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.log('Logout error:', e);
    }
    clearLogoutTimer();
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
  };

  const applyToken = async (newToken) => {
    if (!newToken) return;
    localStorage.setItem('token', newToken);
    setToken(newToken);

    console.log('JWT token (frontend):', newToken);

    const payload = parseJwt(newToken);
    if (payload?.exp) {
      const msUntilExpiry = payload.exp * 1000 - Date.now();
      if (msUntilExpiry <= 0) {
        await logout();
        return;
      }
      clearLogoutTimer();
      logoutTimerRef.current = setTimeout(() => {
        logout();
      }, msUntilExpiry);
    }

    try {
      const data = await api.request('/', { method: 'GET', token: newToken });

      if (data?.user) setUser(data.user);
      setLoading(false);
    } catch (e) {
      console.log('Token validation error:', e);

      await logout();
      setLoading(false);
    }
  };

  const login = async ({ emailOrUsername, password }) => {
    const data = await api.request('/auth/login', {
      method: 'POST',
      body: { emailOrUsername, password },
    });

    const receivedToken = data?.token;
    if (!receivedToken) throw new Error('No token returned from server');

    await applyToken(receivedToken);
  };

  const signup = async ({
    username,
    name,
    email,
    password,
    bio,
    dateOfBirth,
    gender,
  }) => {
    const body = { username, name, email, password, bio, dateOfBirth, gender };
    const data = await api.request('/auth/signup', { method: 'POST', body });
    return data;
  };

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const payload = parseJwt(token);
      if (!payload || (payload.exp && payload.exp * 1000 <= Date.now())) {
        await logout();
        setLoading(false);
        return;
      }

      if (payload?.exp) {
        const msUntilExpiry = payload.exp * 1000 - Date.now();
        clearLogoutTimer();
        logoutTimerRef.current = setTimeout(() => {
          logout();
        }, msUntilExpiry);
      }

      try {
        const data = await api.request('/', { method: 'GET', token });
        if (!ignore) {
          if (data?.user) setUser(data.user);
        }
      } catch (e) {
        console.log('Session restore failed:', e);
        await logout();
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    init();
    return () => {
      ignore = true;
      clearLogoutTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = { user, token, loading, login, logout, signup, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
