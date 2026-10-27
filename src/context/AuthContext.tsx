import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, GENERATED_ADMIN_EMAIL, GENERATED_ADMIN_PASSWORD } from '../lib/firebase';

export interface UserSession {
  id?: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isOwnerAdmin: boolean;
  loading: boolean;
  ownerEmail: string;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  setAuthError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const OWNER_EMAIL = GENERATED_ADMIN_EMAIL;

export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  const envAdmin = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAIL)
    ? String(import.meta.env.VITE_ADMIN_EMAIL).toLowerCase().trim()
    : '';
  return (
    lower === GENERATED_ADMIN_EMAIL.toLowerCase() ||
    lower === 'happyperson7410@gmail.com' ||
    (envAdmin !== '' && lower === envAdmin)
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email && isOwner(fbUser.email)) {
        const idToken = await fbUser.getIdToken();
        setUser({
          id: fbUser.uid,
          email: fbUser.email,
          role: 'admin',
        });
        setToken(idToken);
      } else if (fbUser) {
        // Disallow any non-admin accounts
        await signOut(auth);
        setUser(null);
        setToken(null);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const email = cred.user.email?.toLowerCase();

      if (!email || !isOwner(email)) {
        await signOut(auth);
        setUser(null);
        setToken(null);
        const err = `Access denied for ${email || 'this Google account'}. Only the portfolio owner is authorized.`;
        setAuthError(err);
        throw new Error(err);
      }

      // Record in admins collection for audit and security rules
      await setDoc(
        doc(db, 'admins', cred.user.uid),
        {
          email: cred.user.email || '',
          displayName: cred.user.displayName || 'Portfolio Owner',
          role: 'owner',
          provider: 'google',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const idToken = await cred.user.getIdToken();
      setUser({
        id: cred.user.uid,
        email: cred.user.email || '',
        role: 'admin',
      });
      setToken(idToken);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return; // User clicked away from popup
      }
      const msg = err.message || 'Google sign-in failed. Please try again.';
      setAuthError(msg);
      throw err;
    }
  };

  const handleLoginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    const trimmed = email.trim();

    if (!trimmed || !pass) {
      const err = 'Please enter both email and password.';
      setAuthError(err);
      throw new Error(err);
    }

    // Strict security check: only the generated owner account is permitted
    if (trimmed.toLowerCase() !== GENERATED_ADMIN_EMAIL.toLowerCase()) {
      const err = 'Invalid email or password.';
      setAuthError(err);
      throw new Error(err);
    }

    try {
      // 1. Try logging into Firebase Auth
      const userCred = await signInWithEmailAndPassword(auth, GENERATED_ADMIN_EMAIL, pass);
      const idToken = await userCred.user.getIdToken();
      setUser({
        id: userCred.user.uid,
        email: userCred.user.email || GENERATED_ADMIN_EMAIL,
        role: 'admin',
      });
      setToken(idToken);
    } catch (firebaseErr: any) {
      // If user does not exist yet in the new Firebase project, bootstrap the generated owner account
      if (
        (firebaseErr.code === 'auth/user-not-found' ||
          firebaseErr.code === 'auth/invalid-credential' ||
          firebaseErr.code === 'auth/invalid-login-credentials') &&
        pass === GENERATED_ADMIN_PASSWORD
      ) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, GENERATED_ADMIN_EMAIL, GENERATED_ADMIN_PASSWORD);
          // Register in admins collection
          await setDoc(
            doc(db, 'admins', newCred.user.uid),
            {
              email: GENERATED_ADMIN_EMAIL,
              role: 'owner',
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );

          const idToken = await newCred.user.getIdToken();
          setUser({
            id: newCred.user.uid,
            email: newCred.user.email || GENERATED_ADMIN_EMAIL,
            role: 'admin',
          });
          setToken(idToken);
          return;
        } catch (createErr: any) {
          console.error('Admin bootstrap note:', createErr);
        }
      }

      const err = 'Invalid email or password.';
      setAuthError(err);
      throw new Error(err);
    }
  };

  const handleRegisterWithEmail = async () => {
    const err = 'Registration is disabled. Only the designated administrator can access the CMS.';
    setAuthError(err);
    throw new Error(err);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Signout note:', err);
    }
    setUser(null);
    setToken(null);
    setAuthError(null);
  };

  const isOwnerAdmin = Boolean(user && isOwner(user.email));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isOwnerAdmin,
        loading,
        ownerEmail: OWNER_EMAIL,
        loginWithGoogle,
        loginWithEmail: handleLoginWithEmail,
        registerWithEmail: handleRegisterWithEmail,
        logout: handleLogout,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
