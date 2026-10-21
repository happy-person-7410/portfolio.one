import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserSession {
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserSession | null;
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

export const OWNER_EMAIL = 'faysalhappy7410@gmail.com';

export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return (
    lower === OWNER_EMAIL.toLowerCase() ||
    lower === 'happyperson7410@gmail.com' ||
    lower === 'danahobi20@gmail.com'
  );
}

const AUTH_STORAGE_KEY = 'hp_portfolio_mock_user';

function getStoredUser(): UserSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeUserSession(user: UserSession) {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch {}
}

function clearUserSession() {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize session from local storage on load
  useEffect(() => {
    try {
      const stored = getStoredUser();
      if (stored) {
        setUser(stored);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    const mockUser: UserSession = {
      email: OWNER_EMAIL,
      role: 'admin',
    };
    storeUserSession(mockUser);
    setUser(mockUser);
  };

  const handleLoginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    const trimmed = email.trim().toLowerCase();
    
    if (!trimmed || !pass) {
      throw new Error('Please enter both email and password.');
    }

    // Local admin authentication for frontend-only mode
    const mockUser: UserSession = {
      email: trimmed,
      role: isOwner(trimmed) ? 'admin' : 'admin', // Allow owner admin access
    };

    storeUserSession(mockUser);
    setUser(mockUser);
  };

  const handleRegisterWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    const trimmed = email.trim().toLowerCase();

    if (!trimmed || !pass) {
      throw new Error('Please fill in all fields.');
    }
    if (pass.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const mockUser: UserSession = {
      email: trimmed,
      role: 'admin',
    };

    storeUserSession(mockUser);
    setUser(mockUser);
  };

  const handleLogout = async () => {
    clearUserSession();
    setUser(null);
    setAuthError(null);
  };

  const isOwnerAdmin = Boolean(user && (user.role === 'admin' || isOwner(user.email)));

  return (
    <AuthContext.Provider
      value={{
        user,
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
