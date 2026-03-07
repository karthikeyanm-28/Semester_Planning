import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { auth } from '@/config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [storedUser, setStoredUser] = useLocalStorage<User | null>('user-data', null);
  const [user, setUser] = useState<User | null>(storedUser);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Firebase auth listener
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Immediate check - if auth is not initialized, set loading to false
    if (!auth) {
      console.warn("Firebase auth not initialized");
      setIsLoading(false);
      return;
    }

    // Fallback timeout to prevent infinite loading (3 seconds)
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn("Auth state check timed out after 3s - setting isLoading to false");
        setIsLoading(false);
      }
    }, 3000);

    try {
      const unsubscribe = onAuthStateChanged(auth, 
        (firebaseUser: FirebaseUser | null) => {
          if (!isMounted) return;

          clearTimeout(timeoutId);

          try {
            if (firebaseUser) {
              // User is signed in with Firebase
              const userData: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email || '',
                institution: '',
              };
              setStoredUser(userData);
              setUser(userData);
            } else {
              // User is signed out - check local storage
              setStoredUser(null);
              setUser(null);
            }
          } catch (error) {
            console.error('Error processing auth state:', error);
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        },
        (error) => {
          console.error('Firebase auth error:', error);
          clearTimeout(timeoutId);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      );

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      clearTimeout(timeoutId);
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, []);

  const login = useCallback((newUser: User) => {
    setStoredUser(newUser);
    setUser(newUser);
  }, [setStoredUser]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setStoredUser(null);
      setUser(null);
      // Clear academic data on logout
      localStorage.removeItem('academic-data');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [setStoredUser]);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      const error = new Error("Firebase Auth not initialized. Cannot sign in.");
      console.error(error.message);
      throw error;
    }

    try {
      console.log("Starting Google Sign-In...");
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'consent' });
      
      console.log("Showing Google Sign-In popup...");
      const result = await signInWithPopup(auth, provider);
      
      console.log("Google Sign-In successful for user:", result.user.email);
      
      const userData: User = {
        id: result.user.uid,
        name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        email: result.user.email || '',
        institution: '',
      };
      
      console.log("Storing user data:", userData);
      setStoredUser(userData);
      setUser(userData);
      console.log("User successfully signed in and stored");
    } catch (error: any) {
      const errorCode = error?.code;
      const errorMsg = error?.message || String(error);
      
      // Handle specific Firebase auth errors
      if (errorCode === 'auth/cancelled-popup-request') {
        console.warn("Google Sign-In popup was cancelled by user");
      } else if (errorCode === 'auth/popup-blocked') {
        console.error("Google Sign-In popup was blocked by browser");
      } else if (errorCode === 'auth/popup-closed-by-user') {
        console.warn("Google Sign-In popup was closed by user");
      } else {
        console.error(`Google Sign-In error [${errorCode}]:`, errorMsg);
      }
      
      throw error;
    }
  }, [setStoredUser]);

  const updateUser = useCallback((updatedUser: User) => {
    setStoredUser(updatedUser);
    setUser(updatedUser);
  }, [setStoredUser]);

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      signInWithGoogle,
      updateUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
