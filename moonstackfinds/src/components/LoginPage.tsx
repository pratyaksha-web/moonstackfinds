import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Lock, Sparkles, AlertCircle, Compass, Home } from 'lucide-react';
import { auth } from '../firebase';

interface LoginPageProps {
  onBackToHome: () => void;
  onLoginSuccess: () => void;
}

export default function LoginPage({ onBackToHome, onLoginSuccess }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const provider = new GoogleAuthProvider();
      // Enforce choosing an account
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email && user.email.toLowerCase() === 'workly244@gmail.com') {
        onLoginSuccess();
      } else {
        // Log out immediately if unauthorized
        await signOut(auth);
        setErrorMsg('Access Denied: Only workly244@gmail.com has administrator credentials.');
      }
    } catch (e: any) {
      console.error('Login error', e);
      if (e.code === 'auth/popup-blocked') {
        setErrorMsg('Popup blocked. Please allow popups for this site to sign in with Google.');
      } else if (e.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Login popup was cancelled before signing in.');
      } else {
        setErrorMsg(`Authentication failed: ${e.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-cozy-beige min-h-screen flex items-center justify-center px-4">
      <div className="bg-cozy-cream rounded-3.5xl p-8 sm:p-12 max-w-md w-full border border-cozy-rose/25 shadow-xl text-center space-y-8 relative overflow-hidden">
        {/* Floating background blur nodes */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-cozy-burgundy/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cozy-burgundy/5 rounded-full blur-xl pointer-events-none" />

        <div className="inline-flex p-4 rounded-full bg-cozy-rose/20 text-cozy-burgundy relative">
          <Lock className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cozy-burgundy opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cozy-burgundy"></span>
          </span>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-cozy-rose">
            <Sparkles className="w-3 h-3 animate-spin duration-3000" />
            <span>MoonStack Portal</span>
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-stone-900 tracking-tight">
            Admin Workspace
          </h2>
          <p className="text-cozy-brown text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Authorized administrators may access the curated products database, categorize finds, and update blog reviews.
          </p>
        </div>

        {errorMsg && (
          <div className="text-xs bg-red-50 border border-red-200/60 text-red-700 p-4 rounded-2xl flex items-start text-left space-x-2 font-medium leading-relaxed shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-3 bg-white hover:bg-stone-50 border border-stone-200 hover:border-cozy-rose/25 text-stone-800 font-bold py-3.5 px-5 rounded-2xl transition-all cursor-pointer shadow-sm text-sm active:scale-98 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            id="admin-google-auth-btn"
          >
            {loading ? (
              <>
                <Compass className="w-5 h-5 animate-spin text-cozy-burgundy" />
                <span className="text-stone-500">Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Sign in with Google Admin</span>
              </>
            )}
          </button>

          <button
            onClick={onBackToHome}
            className="w-full flex items-center justify-center space-x-2 bg-transparent hover:bg-cozy-rose/10 text-cozy-brown hover:text-cozy-burgundy py-3 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            id="back-to-home-btn"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/50 text-left text-[11px] text-stone-500 space-y-1">
          <span className="font-bold block uppercase tracking-wider text-stone-700">🔒 Secure Firebase Access Guard</span>
          <p>
            Authentication is sandboxed via Google Identity. Authorization is exclusive to email user <strong>workly244@gmail.com</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
