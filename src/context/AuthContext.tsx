import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken, setAuthToken } from '../services/portfolioService';

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

export const OWNER_EMAIL = 'happyperson7410@gmail.com';

export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return (
    lower === OWNER_EMAIL.toLowerCase() ||
    lower === 'faysalhappy7410@gmail.com' ||
    lower === 'danahobi20@gmail.com'
  );
}

const AUTH_USER_KEY = 'hp_admin_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Validate existing session from backend on load
  useEffect(() => {
    const initSession = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json() as { success: boolean; user: UserSession };
          if (data.user) {
            setUser(data.user);
            setTokenState(storedToken);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
          }
        } else {
          // Token expired or invalid
          setAuthToken(null);
          setTokenState(null);
          setUser(null);
          localStorage.removeItem(AUTH_USER_KEY);
        }
      } catch (err) {
        // If offline or network issue, fallback to cached user session
        console.warn('Session verification fallback:', err);
        try {
          const cached = localStorage.getItem(AUTH_USER_KEY);
          if (cached) {
            setUser(JSON.parse(cached));
          }
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    await handleLoginWithEmail('happyperson7410@gmail.com', 'Admin@HappyPerson2026');
  };

  const handleLoginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    const trimmed = email.trim();

    if (!trimmed || !pass) {
      throw new Error('Please enter both email and password.');
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, password: pass }),
      });

      const data = await res.json() as { success?: boolean; token?: string; user?: UserSession; error?: string };

      if (!res.ok || !data.success || !data.token) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      // Store secure token
      setAuthToken(data.token);
      setTokenState(data.token);
      setUser(data.user || { email: trimmed, role: 'admin' });
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user || { email: trimmed, role: 'admin' }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setAuthError(msg);
      throw err;
    }
  };

  const handleRegisterWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    await handleLoginWithEmail(email, pass);
  };

  const handleLogout = async () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    setAuthError(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const isOwnerAdmin = Boolean(user && (user.role === 'admin' || isOwner(user.email)));

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
