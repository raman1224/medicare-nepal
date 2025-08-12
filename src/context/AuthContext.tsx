"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  auth, 
  googleProvider, 
  githubProvider,
  db
} from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  UserCredential,
  User,
  sendPasswordResetEmail,
  updateProfile,
  AuthError,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// Define user data structure
interface UserData {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
  role: string;
  lastLogin?: Date;
  phone?: string;
}

// Context interface
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  isEmailRegistered: (email: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  authError: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);
            
            // Update last login
            await updateDoc(doc(db, "users", user.uid), {
              lastLogin: serverTimestamp()
            });
          } else {
            // Create user document if it doesn't exist
            const newUserData: UserData = {
              uid: user.uid,
              name: user.displayName || "User",
              email: user.email || "",
              photoURL: user.photoURL || undefined,
              createdAt: new Date(),
              role: "user"
            };
            
            await setDoc(doc(db, "users", user.uid), newUserData);
            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAuthError("Failed to load user data");
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
      setAuthError(null);
    });
    
    return unsubscribe;
  }, []);

  // Check if email is already registered
  const isEmailRegistered = useCallback(async (email: string): Promise<boolean> => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  }, []);

  // Login with email/password
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      // Check if email exists
      const emailExists = await isEmailRegistered(email);
      if (!emailExists) {
        throw new Error("Email not registered. Please sign up.");
      }
      
      // Attempt login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login in Firestore
      if (userCredential.user) {
        await updateDoc(doc(db, "users", userCredential.user.uid), {
          lastLogin: serverTimestamp()
        });
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Failed to login. Please try again.";
      if (error instanceof Error) {
        switch ((error as AuthError).code) {
          case "auth/user-not-found":
            errorMessage = "User not found. Please sign up.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password. Please try again.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts. Account temporarily locked.";
            break;
          case "auth/user-disabled":
            errorMessage = "Account disabled. Contact support.";
            break;
          default:
            errorMessage = error.message || "Authentication failed.";
        }
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isEmailRegistered, router]);

  // Signup with email/password
  const signup = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      // Check if email is already registered
      const emailExists = await isEmailRegistered(email);
      if (emailExists) {
        throw new Error("Email already registered. Please login.");
      }
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      
      // Create user document in Firestore
      const userDocData: UserData = {
        uid: userCredential.user.uid,
        name,
        email,
        createdAt: new Date(),
        role: "user"
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), userDocData);
      setUserData(userDocData);
      
      router.push('/dashboard');
    } catch (error) {
      console.error("Signup error:", error);
      
      let errorMessage = "Failed to sign up. Please try again.";
      if (error instanceof Error) {
        switch ((error as AuthError).code) {
          case "auth/email-already-in-use":
            errorMessage = "Email already in use. Please login.";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address.";
            break;
          default:
            errorMessage = error.message || "Registration failed.";
        }
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isEmailRegistered, router]);

  // Google login
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user is new
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document for new user
        const userData: UserData = {
          uid: result.user.uid,
          name: result.user.displayName || "User",
          email: result.user.email || "",
          photoURL: result.user.photoURL || undefined,
          createdAt: new Date(),
          role: "user"
        };
        
        await setDoc(userDocRef, userData);
        setUserData(userData);
      } else {
        // Update last login for existing user
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp()
        });
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error("Google sign in error:", error);
      
      let errorMessage = "Failed to sign in with Google.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // GitHub login
  const loginWithGithub = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const result = await signInWithPopup(auth, githubProvider);
      
      // Check if user is new
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document for new user
        const userData: UserData = {
          uid: result.user.uid,
          name: result.user.displayName || "User",
          email: result.user.email || "",
          photoURL: result.user.photoURL || undefined,
          createdAt: new Date(),
          role: "user"
        };
        
        await setDoc(userDocRef, userData);
        setUserData(userData);
      } else {
        // Update last login for existing user
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp()
        });
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error("GitHub sign in error:", error);
      
      let errorMessage = "Failed to sign in with GitHub.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      
      let errorMessage = "Failed to logout.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Password reset
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      // Check if email exists
      const emailExists = await isEmailRegistered(email);
      if (!emailExists) {
        throw new Error("Email not registered. Please sign up.");
      }
      
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Failed to send password reset email.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isEmailRegistered]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) return;
    
    try {
      // Update Firebase auth profile
      await updateProfile(auth.currentUser, updates);
      
      // Update Firestore document
      if (auth.currentUser.uid) {
        const updateData: Partial<UserData> = {};
        if (updates.displayName) updateData.name = updates.displayName;
        if (updates.photoURL) updateData.photoURL = updates.photoURL;
        
        if (Object.keys(updateData).length > 0) {
          await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
          
          // Update local state
          setUserData(prev => ({
            ...prev!,
            ...updateData
          }));
        }
      }
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile.");
    }
  }, []);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, [currentUser]);

  // Context value
  const value = {
    currentUser,
    userData,
    login,
    signup,
    loginWithGoogle,
    loginWithGithub,
    logout,
    resetPassword,
    loading,
    updateUserProfile,
    isEmailRegistered,
    refreshUserData,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}