import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { auth } from '@/config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { userApi } from '@/services/api';

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

  // Sync user with MongoDB backend
  const syncUserWithBackend = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      const userData = await userApi.sync({
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        institution: '',
      });
      console.log('✓ User synced with MongoDB');
      return userData;
    } catch (error) {
      console.warn('⚠ Could not sync with backend, using local data:', error);
      // Fallback to local-only if backend is not available
      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        institution: '',
      };
    }
  };

  // Initialize Firebase auth listener
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Immediate check - if auth is not initialized, set loading to false
    if (!auth) {
      console.warn("⚠️ Firebase auth not initialized - showing landing page");
      // Set a very short timeout to ensure UI is responsive
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      }, 100);
      return () => {
        clearTimeout(timeoutId);
      };
    }

    // Fallback timeout to prevent infinite loading (800ms)
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn("⚠️ Auth state check timed out - showing landing page");
        setIsLoading(false);
      }
    }, 800);

    try {
      const unsubscribe = onAuthStateChanged(auth, 
        async (firebaseUser: FirebaseUser | null) => {
          if (!isMounted) return;

          clearTimeout(timeoutId);

          try {
            if (firebaseUser) {
              // User is signed in — sync with MongoDB
              const userData = await syncUserWithBackend(firebaseUser);
              setStoredUser(userData);
              setUser(userData);
              console.log('✓ User authenticated:', userData.email);
            } else {
              // User is signed out
              setStoredUser(null);
              setUser(null);
              console.log('✓ No user authenticated');
            }
          } catch (error) {
            console.error('Error processing auth state:', error);
            // Even on error, stop loading and show UI
            setIsLoading(false);
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        },
        (error) => {
          console.error('❌ Firebase auth error:', error);
          clearTimeout(timeoutId);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      );

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        try {
          unsubscribe();
        } catch (e) {
          // Unsubscribe error is not critical
        }
      };
    } catch (error) {
      console.error('❌ Error setting up auth listener:', error);
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
      provider.setCustomParameters({ prompt: 'select_account' });
      
      console.log("Showing Google Sign-In popup...");
      const result = await signInWithPopup(auth, provider);
      
      console.log("Google Sign-In successful for user:", result.user.email);
      
      // Sync with MongoDB backend
      const userData = await syncUserWithBackend(result.user);
      
      console.log("Storing user data:", userData);
      setStoredUser(userData);
      setUser(userData);
      console.log("User successfully signed in and synced with MongoDB");
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

  const updateUser = useCallback(async (updatedUser: User) => {
    setStoredUser(updatedUser);
    setUser(updatedUser);

    // Sync profile update with MongoDB
    try {
      await userApi.update(updatedUser.id, {
        name: updatedUser.name,
        email: updatedUser.email,
        institution: updatedUser.institution,
      });
      console.log('✓ Profile updated in MongoDB');
    } catch (error) {
      console.warn('⚠ Could not update profile in backend:', error);
    }
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
