import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useT } from '@/contexts/I18nContext';
import {
  COLOR_UP,
  COLOR_DOWN,
  COLOR_BG_PRIMARY,
  COLOR_BG_CARD,
  COLOR_BORDER,
  COLOR_ACCENT,
} from '@/lib/colors';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { t } = useT();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validateEmail(v: string): string | null {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : t('auth_email_invalid');
  }

  function validatePassword(v: string): string | null {
    if (!v) return t('auth_password_required');
    if (mode === 'signup') {
      if (v.length < 8) return t('auth_password_min');
      if (!/[A-Za-z]/.test(v)) return t('auth_password_letter');
      if (!/[0-9]/.test(v)) return t('auth_password_digit');
    }
    return null;
  }

  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  function fieldBorder(hasError: boolean) {
    return hasError ? `1px solid ${COLOR_DOWN}` : `1px solid ${COLOR_BORDER}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (validateEmail(email) || validatePassword(password)) return;

    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(t('auth_signup_success'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth_generic_error'));
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccess(null);
    setTouched({ email: false, password: false });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border shadow-2xl"
        style={{ backgroundColor: COLOR_BG_CARD, borderColor: COLOR_BORDER }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: COLOR_BORDER }}>
          <h2 className="text-base font-bold text-white">
            {mode === 'login' ? t('auth_login') : t('auth_signup')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-xs rounded-lg p-3" style={{ backgroundColor: COLOR_DOWN + '15', color: COLOR_DOWN }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-xs rounded-lg p-3" style={{ backgroundColor: COLOR_UP + '15', color: COLOR_UP }}>
              {success}
            </div>
          )}

          <div>
            <label className="text-xs text-text-secondary mb-1 block">{t('auth_email')}</label>
            <input
              type="text"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="name@example.com"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white placeholder-text-secondary"
              style={{ backgroundColor: COLOR_BG_PRIMARY, border: fieldBorder(!!emailError) }}
            />
            {emailError && <p className="text-xs mt-1" style={{ color: COLOR_DOWN }}>{emailError}</p>}
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1 block">{t('auth_password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder={mode === 'signup' ? t('auth_password_hint') : ''}
                className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none text-white placeholder-text-secondary"
                style={{ backgroundColor: COLOR_BG_PRIMARY, border: fieldBorder(!!passwordError) }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordError && <p className="text-xs mt-1" style={{ color: COLOR_DOWN }}>{passwordError}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: COLOR_ACCENT }}
          >
            {loading ? t('auth_processing') : mode === 'login' ? t('auth_login') : t('auth_signup')}
          </button>

          <p className="text-center text-xs text-text-secondary">
            {mode === 'login' ? t('auth_no_account') : t('auth_has_account')}{' '}
            <button type="button" className="text-blue-accent hover:underline" onClick={switchMode}>
              {mode === 'login' ? t('auth_signup') : t('auth_login')}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
