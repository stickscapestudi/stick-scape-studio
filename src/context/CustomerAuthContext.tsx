import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  customerAuthService,
  type CustomerUser,
} from '../services/customer-auth.service';

interface CustomerAuthContextType {
  customer: CustomerUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }) => Promise<void>;
  loginWithGoogle: (googleData: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }) => Promise<void>;
  updateProfile: (data: Partial<CustomerUser>) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerUser | null>(() =>
    customerAuthService.getStoredUser()
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync profile from backend on app load if token exists
  useEffect(() => {
    const initProfile = async () => {
      const token = customerAuthService.getToken();
      if (token) {
        try {
          const profile = await customerAuthService.getProfile();
          setCustomer(profile);
        } catch {
          // If token expired, log out gracefully
          customerAuthService.logout();
          setCustomer(null);
        }
      }
    };
    initProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await customerAuthService.login(email, password);
      setCustomer(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await customerAuthService.register(data);
      setCustomer(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleData: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await customerAuthService.googleAuth(googleData);
      setCustomer(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<CustomerUser>) => {
    setIsLoading(true);
    try {
      const updated = await customerAuthService.updateProfile(data);
      setCustomer(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await customerAuthService.getProfile();
      setCustomer(profile);
    } catch {
      // Ignored
    }
  };

  const logout = () => {
    customerAuthService.logout();
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        isLoading,
        login,
        register,
        loginWithGoogle,
        updateProfile,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
