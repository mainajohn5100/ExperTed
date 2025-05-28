
'use client';

import type { AppwriteUser } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { account, ID } from '@/lib/appwrite'; // Assuming ID might be needed for signup name
import { AppwriteException } from 'appwrite';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: AppwriteUser | null;
  isLoading: boolean;
  login: (email_param: string, password_param: string) => Promise<AppwriteUser | null>;
  logout: () => Promise<void>;
  signup: (email_param: string, password_param: string, name_param: string) => Promise<AppwriteUser | null>;
  // Add other auth functions here if needed, e.g., sendVerificationEmail, updatePassword
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      // Don't redirect here, let protected routes handle it
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email_param: string, password_param: string): Promise<AppwriteUser | null> => {
    setIsLoading(true);
    try {
      await account.createEmailPasswordSession(email_param, password_param);
      const currentUser = await account.get();
      setUser(currentUser);
      setIsLoading(false);
      return currentUser;
    } catch (error) {
      console.error('Failed to login', error);
      setUser(null);
      setIsLoading(false);
      throw error; // Re-throw to handle in UI
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout', error);
      // Still set user to null even if Appwrite logout fails, to clear client state
      setUser(null);
    } finally {
      setIsLoading(false);
      // Redirect to login page after logout, unless already on a public page
      if (pathname !== '/login' && pathname !== '/signup') {
        router.push('/login');
      }
    }
  };

  const signup = async (email_param: string, password_param: string, name_param: string): Promise<AppwriteUser | null> => {
    setIsLoading(true);
    try {
      await account.create(ID.unique(), email_param, password_param, name_param);
      // Automatically log in the user after signup
      await account.createEmailPasswordSession(email_param, password_param);
      const currentUser = await account.get();
      setUser(currentUser);
      setIsLoading(false);
      return currentUser;
    } catch (error) {
      console.error('Failed to signup', error);
      setUser(null);
      setIsLoading(false);
      throw error; // Re-throw to handle in UI
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
