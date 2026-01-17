'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Anonymous login
  const loginAnonymously = async () => {
    try {
      const result = await signInAnonymously(auth);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Anonymous login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Google OAuth login
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google login error:', error);
      
      // Handle specific errors
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Login cancelled' };
      } else if (error.code === 'auth/popup-blocked') {
        return { success: false, error: 'Popup blocked by browser. Please allow popups.' };
      }
      
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous || false,
    loginAnonymously,
    loginWithGoogle,  // ✅ Now properly exported
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
