'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // For redirecting after actions

// Note: This is a significant change from the Appwrite-based useAuth.
// This hook now primarily provides session data and status from NextAuth.
// Functions like signup, updateUserName, updateUserPreferences, etc.,
// will need to be handled by dedicated API calls and services, not directly from this hook.

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // isLoading equivalent
  const isLoading = status === 'loading';

  // The NextAuth session object has a different structure.
  // session.user will contain what NextAuth provides (e.g., email, name, image, id).
  // Appwrite-specific user details (like `prefs` or custom methods) are no longer here directly.
  // These will need to be fetched/managed separately after Prisma setup.
  const user = session?.user || null;

  // Simplified login/logout using NextAuth functions
  // For more complex scenarios (e.g., error handling, specific redirects),
  // components can call signIn/signOut directly.
  const login = async (email_param, password_param) => {
    // Components should ideally call signIn directly for better error handling and callback control.
    // This is a simplified wrapper.
    const result = await signIn('credentials', {
      redirect: false, // Handle redirect in component or rely on NextAuth default
      email: email_param,
      password: password_param,
    });

    if (result?.ok && !result.error) {
      // Optional: trigger a session update if needed, or router.push
      // await update(); // Refreshes the session
      // router.push('/'); // Or a desired callback URL
    }
    return result; // Return the full result for components to handle
  };

  const logout = async () => {
    // Components can call signOut directly.
    // Default behavior redirects to home page after sign out.
    // Can be configured in NextAuth options or here.
    await signOut({ redirect: true, callbackUrl: '/auth/signin' });
  };

  // Placeholder for signup - this will require a separate API endpoint.
  const signup = async (email_param, password_param, name_param) => {
    console.warn("useAuth: signup function is a placeholder and needs to be implemented with an API call.");
    // Example of what it might do:
    // const response = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email: email_param, password: password_param, name: name_param }),
    // });
    // const data = await response.json();
    // if (response.ok) {
    //   // Optionally sign in the user automatically after successful registration
    //   await signIn('credentials', { email: email_param, password: password_param });
    //   return data.user;
    // } else {
    //   throw new Error(data.message || 'Signup failed');
    // }
    return null; // Placeholder
  };

  // Functions like updateUserName, updateUserPreferences, changePassword, refreshUser
  // are removed from here. They were Appwrite-specific.
  // Equivalent functionality will need new API endpoints and client-side services
  // that interact with your Prisma backend.

  return {
    user, // This is now NextAuth's session.user
    isLoading,
    status, // 'loading', 'authenticated', 'unauthenticated'
    session, // The full session object from NextAuth
    login, // Simplified login, components might call signIn directly
    logout, // Simplified logout, components might call signOut directly
    signup, // Placeholder, needs backend implementation
    updateSession: update, // Expose NextAuth's session update function
    // Removed Appwrite-specific methods:
    // updateUserName, updateUserAvatarUrl, updateUserPreferences, changePassword, refreshUser
  };
};
