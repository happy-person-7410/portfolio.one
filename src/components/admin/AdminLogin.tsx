import React, { useState } from 'react';
import { Lock, Mail, Key, ShieldCheck, AlertCircle, ArrowLeft, Chrome, Sparkles } from 'lucide-react';
import { useAuth, isOwner } from '../../context/AuthContext';

interface AdminLoginProps {
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToSite }) => {
  const { user, isOwnerAdmin, ownerEmail, loginWithEmail, registerWithEmail, loginWithGoogle, logout, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (isRegisterMode) {
      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters long.');
        return;
      }
      if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        setLocalError('Password must contain both letters and numbers.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await registerWithEmail(email.trim(), password);
      } else {
        await loginWithEmail(email.trim(), password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('user-not-found') || msg.includes('invalid-credential')) {
        setLocalError('Invalid email or password. If this is your first time, click "Set up Owner Account".');
      } else if (msg.includes('email-already-in-use')) {
        setLocalError('Account already exists. Please sign in with your password.');
        setIsRegisterMode(false);
      } else {
        setLocalError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in cancelled or failed';
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  // If signed in but not the owner email
  if (user && !isOwnerAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-400 mb-4">
            You are signed in as <span className="text-slate-200 font-medium">{user.email}</span>, but this admin panel is strictly reserved for the site owner (<span className="text-blue-400 font-mono">{ownerEmail}</span>).
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition text-sm cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
            <button
              onClick={onBackToSite}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition text-sm cursor-pointer"
            >
              Return to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-[#0b0f17] to-slate-900 text-slate-100">
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </button>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Studio CMS
          </span>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 ring-4 ring-slate-800">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Owner Admin Portal</h1>
          <p className="text-sm text-slate-400 mt-1">
            Private management suite for <span className="text-blue-400 font-medium">Happy Person</span>
          </p>
        </div>

        {/* Error message */}
        {(localError || authError) && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Google One-Click Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium rounded-xl border border-slate-700 hover:border-slate-600 transition shadow-sm text-sm mb-5 cursor-pointer disabled:opacity-50"
        >
          <Chrome className="w-4 h-4 text-blue-400" />
          Sign in with Google ({ownerEmail})
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <span className="relative px-3 bg-slate-900 text-xs text-slate-500 uppercase tracking-wider">
            Or with email & password
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Owner Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ownerEmail}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition text-sm cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRegisterMode ? (
              <>
                <Sparkles className="w-4 h-4" /> Create Owner Credentials
              </>
            ) : (
              'Enter Admin Dashboard'
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setLocalError(null);
            }}
            className="text-xs text-blue-400 hover:text-blue-300 transition cursor-pointer"
          >
            {isRegisterMode
              ? 'Already set up? Sign in instead'
              : 'First time setup? Create owner password'}
          </button>
        </div>

      </div>
    </div>
  );
};
