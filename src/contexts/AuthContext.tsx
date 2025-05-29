
'use client';

import type { AppwriteUser, Models, UserPreferences } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { account, ID, updateUserNameInAppwrite, updateUserPrefsInAppwrite } from '@/lib/appwrite';
import { AppwriteException } from 'appwrite';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: AppwriteUser | null;
  isLoading: boolean;
  login: (email_param: string, password_param: string) => Promise<AppwriteUser | null>;
  logout: () => Promise<void>;
  signup: (email_param: string, password_param: string, name_param: string) => Promise<AppwriteUser | null>;
  updateUserName: (newName: string) => Promise<void>;
  updateUserAvatarUrl: (newAvatarUrl: string) => Promise<void>;
  updateUserPreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
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
      setUser(currentUser as AppwriteUser);
    } catch (error) {
      setUser(null);
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
      setUser(currentUser as AppwriteUser);
      setIsLoading(false);
      return currentUser as AppwriteUser;
    } catch (error) {
      console.error('Failed to login', error);
      setUser(null);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout', error);
      setUser(null); 
    } finally {
      setIsLoading(false);
      if (pathname !== '/login' && pathname !== '/signup') {
        router.push('/login');
      }
    }
  };

  const signup = async (email_param: string, password_param: string, name_param: string): Promise<AppwriteUser | null> => {
    setIsLoading(true);
    try {
      await account.create(ID.unique(), email_param, password_param, name_param);
      await account.createEmailPasswordSession(email_param, password_param);
      const currentUser = await account.get();
      setUser(currentUser as AppwriteUser);
      setIsLoading(false);
      return currentUser as AppwriteUser;
    } catch (error) {
      console.error('Failed to signup', error);
      setUser(null);
      setIsLoading(false);
      throw error;
    }
  };

  const updateUserName = async (newName: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    const updatedUser = await updateUserNameInAppwrite(newName);
    setUser(updatedUser as AppwriteUser);
  };

  const updateUserAvatarUrl = async (newAvatarUrl: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    const currentPrefs = (user.prefs as UserPreferences) || {};
    const updatedUser = await updateUserPrefsInAppwrite({ ...currentPrefs, avatarUrl: newAvatarUrl });
    setUser(updatedUser as AppwriteUser);
  };
  
  const updateUserPreferences = async (newPrefsToUpdate: Partial<UserPreferences>): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    const currentPrefs = (user.prefs as UserPreferences) || {};
    const updatedUser = await updateUserPrefsInAppwrite({ ...currentPrefs, ...newPrefsToUpdate });
    setUser(updatedUser as AppwriteUser); 
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated to change password.");
    try {
      await account.updatePassword(newPassword, currentPassword);
    } catch (error) {
      console.error("Failed to change password in Appwrite:", error);
      throw error; // Re-throw for the UI to handle
    }
  };
  
  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await account.get();
      setUser(currentUser as AppwriteUser);
    } catch (error) {
      console.error("Failed to refresh user", error);
      if ((error as AppwriteException).code === 401) { 
        setUser(null);
         if (pathname !== '/login' && pathname !== '/signup') {
            router.push('/login');
         }
      }
    }
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signup, updateUserName, updateUserAvatarUrl, updateUserPreferences, changePassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
