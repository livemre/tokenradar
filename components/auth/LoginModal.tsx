'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

type AuthMode = 'login' | 'signup' | 'confirm';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}


export function LoginModal() {
  const t = useTranslations('auth');
  const {
    isLoginModalOpen,
    closeLoginModal,
    signInWithOAuth,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setMode('login');
  };

  const handleClose = () => {
    resetForm();
    closeLoginModal();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const { error: err } = await signInWithEmail(email, password);
      if (err) setError(err.message);
    } else {
      const { error: err, confirmEmail } = await signUpWithEmail(email, password, displayName);
      if (err) {
        setError(err.message);
      } else if (confirmEmail) {
        setMode('confirm');
      }
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#12121a] shadow-2xl shadow-black/60 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {mode === 'confirm'
                  ? t('checkEmail')
                  : mode === 'login'
                    ? t('loginTitle')
                    : t('signupTitle')}
              </h2>
              <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/5 text-muted transition-colors">
                <X size={18} />
              </button>
            </div>

            {mode === 'confirm' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-safe/10 flex items-center justify-center">
                  <Mail size={28} className="text-safe" />
                </div>
                <p className="text-sm text-muted leading-relaxed">{t('confirmMessage')}</p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-4 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-colors btn-press"
                >
                  OK
                </button>
              </div>
            ) : (
              <>
                {/* Google OAuth */}
                <button
                  onClick={() => signInWithOAuth('google')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-medium hover:bg-white/[0.08] transition-all btn-press mb-4"
                >
                  <GoogleIcon />
                  {t('continueWithGoogle')}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-muted">{t('orContinueWith')}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Email form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  {mode === 'signup' && (
                    <input
                      type="text"
                      placeholder={t('displayName')}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm placeholder:text-muted focus:outline-none focus:border-safe/40 transition-colors"
                    />
                  )}
                  <input
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm placeholder:text-muted focus:outline-none focus:border-safe/40 transition-colors"
                  />
                  <input
                    type="password"
                    placeholder={t('password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm placeholder:text-muted focus:outline-none focus:border-safe/40 transition-colors"
                  />

                  {error && (
                    <p className="text-xs text-danger px-1">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-safe/10 text-safe font-semibold text-sm hover:bg-safe/20 transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {mode === 'login' ? t('login') : t('createAccount')}
                  </button>
                </form>

                {/* Toggle login/signup */}
                <p className="text-xs text-muted text-center mt-4">
                  {mode === 'login' ? t('noAccount') : t('hasAccount')}{' '}
                  <button
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                    className="text-safe hover:underline"
                  >
                    {mode === 'login' ? t('createAccount') : t('login')}
                  </button>
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
