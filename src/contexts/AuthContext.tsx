'use client';

/**
 * BiasBreaker Authentication Context
 * Provides role-based authentication with Firebase Auth and Firestore
 * Supports three user types: student, college_admin, super_admin
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, UserRole } from '@/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Extended user type with Firebase UID for auth context
 */
interface AuthUser extends Omit<User, 'createdAt'> {
  uid: string;
  createdAt: Date | null;
}

/**
 * Signup credentials with display name
 */
interface SignupCredentials {
  email: string;
  password: string;
  displayName: string;
}

/**
 * Login credentials
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Auth context value type
 */
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isCollegeAdmin: boolean;
  isStudent: boolean;
  signup: (credentials: SignupCredentials) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

/**
 * College info extracted from email domain
 */
interface CollegeInfo {
  collegeName: string;
  collegeId: string;
}

// ============================================================================
// College Domain Mapping
// ============================================================================

/**
 * Maps email domains to college information
 * Add new colleges here as the platform expands
 */
const COLLEGE_DOMAIN_MAP: Record<string, CollegeInfo> = {
  'mitcoe.edu': {
    collegeName: 'MIT College of Engineering, Pune',
    collegeId: 'mit-coe-pune',
  },
  'coep.edu': {
    collegeName: 'College of Engineering, Pune',
    collegeId: 'coep-pune',
  },
  'viit.edu': {
    collegeName: 'Vishwakarma Institute, Pune',
    collegeId: 'viit-pune',
  },
};

/**
 * Extracts college information from email domain
 * Falls back to generating college name from domain if not in mapping
 */
function getCollegeFromEmail(email: string): CollegeInfo {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return {
      collegeName: 'Unknown College',
      collegeId: 'unknown-college',
    };
  }

  // Check if domain exists in our mapping
  if (COLLEGE_DOMAIN_MAP[domain]) {
    return COLLEGE_DOMAIN_MAP[domain];
  }

  // Extract college name from domain (e.g., test@xyz.edu → XYZ College)
  const domainParts = domain.split('.');
  const collegePart = domainParts[0];
  
  // Capitalize and format college name
  const collegeName = `${collegePart.toUpperCase()} College`;
  const collegeId = `${collegePart.toLowerCase()}-college`;

  return { collegeName, collegeId };
}

// ============================================================================
// Auth Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// Auth Provider Component
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed role checks
  const isAdmin = user?.role === 'super_admin';
  const isCollegeAdmin = user?.role === 'college_admin';
  const isStudent = user?.role === 'student';

  /**
   * Clears any existing error message
   */
  const clearError = () => setError(null);

  /**
   * Fetches user document from Firestore and updates state
   */
  async function fetchUserData(firebaseUser: FirebaseUser): Promise<AuthUser | null> {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          email: data.email || firebaseUser.email || '',
          displayName: data.displayName || firebaseUser.displayName || '',
          role: data.role as UserRole,
          collegeName: data.collegeName || '',
          collegeId: data.collegeId || '',
          createdAt: data.createdAt?.toDate() || null,
        };
      }

      // User document doesn't exist - create it (legacy user case)
      const collegeInfo = getCollegeFromEmail(firebaseUser.email || '');
      const newUserData = {
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        role: 'student' as UserRole,
        collegeName: collegeInfo.collegeName,
        collegeId: collegeInfo.collegeId,
        createdAt: serverTimestamp(),
      };

      await setDoc(userDocRef, newUserData);

      return {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: newUserData.email,
        displayName: newUserData.displayName,
        role: newUserData.role,
        collegeName: newUserData.collegeName,
        collegeId: newUserData.collegeId,
        createdAt: new Date(),
      };
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  }

  /**
   * Creates a new user account with email and password
   * Stores user document in Firestore with college info detected from email
   */
  async function signup({ email, password, displayName }: SignupCredentials): Promise<void> {
    try {
      setError(null);
      setLoading(true);

      // Validate email domain
      if (!email.toLowerCase().endsWith('.edu')) {
        throw new Error('Please use your college email address');
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase profile with display name
      await updateProfile(firebaseUser, { displayName });

      // Extract college info from email domain
      const collegeInfo = getCollegeFromEmail(email);

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userData = {
        email: email.toLowerCase(),
        displayName,
        role: 'student' as UserRole, // Default role for all new signups
        collegeName: collegeInfo.collegeName,
        collegeId: collegeInfo.collegeId,
        createdAt: serverTimestamp(),
      };

      await setDoc(userDocRef, userData);

      // Update local state
      setUser({
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        collegeName: userData.collegeName,
        collegeId: userData.collegeId,
        createdAt: new Date(),
      });
    } catch (err) {
      // Handle specific Firebase auth errors
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Signs in a user with email and password
   * Fetches user document from Firestore to get role and college info
   */
  async function login({ email, password }: LoginCredentials): Promise<AuthUser> {
    try {
      setError(null);
      setLoading(true);

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user data from Firestore
      const userData = await fetchUserData(firebaseUser);

      if (!userData) {
        throw new Error('Failed to load user data');
      }

      setUser(userData);
      return userData;
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Signs out the current user and clears state
   */
  async function logout(): Promise<void> {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Auth state change listener
   * Persists auth state across page refreshes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - fetch their data
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Context value
  const value: AuthContextType = {
    user,
    loading,
    isAdmin,
    isCollegeAdmin,
    isStudent,
    signup,
    login,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Converts Firebase auth errors to user-friendly messages
 */
function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const errorCode = (error as { code?: string }).code;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled';
      case 'auth/weak-password':
        return 'Password must be at least 8 characters';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Connection error. Please try again.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
  return 'An unexpected error occurred';
}

export default AuthProvider;
