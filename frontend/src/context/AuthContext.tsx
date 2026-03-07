import { useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth.types';
import { AuthContext } from './auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, _] = useState<User | null>(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: false,
        login: () => {},
        logout: () => {},
        updateUser: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
