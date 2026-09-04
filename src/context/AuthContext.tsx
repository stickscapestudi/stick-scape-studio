import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type AdminUserProfile } from '../services/auth.service';

interface AuthContextType {
  user: AdminUserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUserProfile | null>(() => authService.getStoredAdmin());
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isAuthenticated = !!token && !!user;

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setToken(res.token);
      setUser(res.admin);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for 401 Unauthorized events from apiFetch
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('stick_scape_admin_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('stick_scape_admin_unauthorized', handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
