import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth.types';
import axios from 'axios';
import { API_URL } from '../config/env';
import { AuthContext } from './auth';

const STORAGE_KEYS = {
  user: 'user',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
} as const;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionRestored = useRef(false);

  useEffect(() => {
    if (sessionRestored.current) return;

    sessionRestored.current = true;

    const restoreSession = async () => {
      const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);

      if (!storedRefreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: tokens } = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${API_URL}/auth/refreshToken`,
          {},
          { headers: { Authorization: `Bearer ${storedRefreshToken}` } },
        );

        localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);

        const { data: userData } = await axios.get<{
          _id: string;
          username: string;
          email?: string;
          photoUrl?: string;
        }>(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${tokens.accessToken}` } });

        const restoredUser: User = {
          id: userData._id,
          username: userData.username,
          email: userData.email,
          photoUrl: userData.photoUrl,
        };

        setUser(restoredUser);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(restoredUser));
      } catch {
        setUser(null);

        localStorage.removeItem(STORAGE_KEYS.user);
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
      } finally {
        setIsLoading(false);
      }
    };
    void restoreSession();
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData);

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
