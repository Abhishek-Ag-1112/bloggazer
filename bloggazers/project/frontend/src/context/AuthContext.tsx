// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db, googleProvider } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types'; // <-- This will now import the updated User type
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      // Cleanup previous user listener if auth state changes
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        // Listen to user document changes in real-time
        // This ensures role updates (like 'admin') are reflected immediately
        // @ts-ignore - onSnapshot return type handling
        const { onSnapshot } = await import('firebase/firestore');

        unsubscribeUserDoc = onSnapshot(userDocRef, async (snapshot) => {
          if (snapshot.exists()) {
            // User exists, update state
            setUser({ id: snapshot.id, ...snapshot.data() } as User);
            setLoading(false);
          } else {
            // --- NEW USER CREATION ---
            // If document doesn't exist, create it.
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              full_name: firebaseUser.displayName || 'New User',
              avatar_url: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              bio: '',
              status: 'pending',
              role: 'user',
              username: '',
              socials: {},
              profession: ''
            };

            // Create in Firestore
            await setDoc(userDocRef, newUser);
            // trigger re-render isn't strictly needed as setDoc -> snapshot update -> setUser
          }
        }, (error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });

      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const signIn = async () => {
    const toastId = toast.loading('Signing in...');
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Welcome!', { id: toastId }); // Changed message
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      toast.error('Failed to sign in. Please try again.', { id: toastId });
    }
  };

  const signOut = async () => {
    const toastId = toast.loading('Signing out...');
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully.', { id: toastId });
    } catch (error) {
      console.error("Error signing out: ", error);
      toast.error('Failed to sign out.', { id: toastId });
    }
  };

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() } as User);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};