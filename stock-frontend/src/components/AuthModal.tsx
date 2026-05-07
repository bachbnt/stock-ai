import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../contexts/I18nContext';

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
    return hasError ? '1px solid #ea3943' : '1px solid #2a2b2e';
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
        style={{ backgroundColor: '#1a1b1e', borderColor: '#2a2b2e' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#2a2b2e' }}>
          <h2 className="text-base font-bold text-white">
            {mode === 'login' ? t('auth_login') : t('auth_signup')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#22232a] text-[#858ca2] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-xs rounded-lg p-3" style={{ backgroundColor: '#ea394315', color: '#ea3943' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-xs rounded-lg p-3" style={{ backgroundColor: '#16c78415', color: '#16c784' }}>
              {success}
            </div>
          )}

          <div>
            <label className="text-xs text-[#858ca2] mb-1 block">{t('auth_email')}</label>
            <input
              type="text"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="name@example.com"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white placeholder-[#858ca2]"
              style={{ backgroundColor: '#0d0e11', border: fieldBorder(!!emailError) }}
            />
            {emailError && <p className="text-xs mt-1" style={{ color: '#ea3943' }}>{emailError}</p>}
          </div>

          <div>
            <label className="text-xs text-[#858ca2] mb-1 block">{t('auth_password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder={mode === 'signup' ? t('auth_password_hint') : ''}
                className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none text-white placeholder-[#858ca2]"
                style={{ backgroundColor: '#0d0e11', border: fieldBorder(!!passwordError) }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858ca2] hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordError && <p className="text-xs mt-1" style={{ color: '#ea3943' }}>{passwordError}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: '#3861fb' }}
          >
            {loading ? t('auth_processing') : mode === 'login' ? t('auth_login') : t('auth_signup')}
          </button>

          <p className="text-center text-xs text-[#858ca2]">
            {mode === 'login' ? t('auth_no_account') : t('auth_has_account')}{' '}
            <button type="button" className="text-[#3861fb] hover:underline" onClick={switchMode}>
              {mode === 'login' ? t('auth_signup') : t('auth_login')}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
