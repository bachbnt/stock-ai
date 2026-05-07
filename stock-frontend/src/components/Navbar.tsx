import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, LogOut, LogIn, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/usePortfolio';
import { useT } from '@/contexts/I18nContext';
import type { Locale } from '@/lib/i18n';
import { AuthModal } from './AuthModal';
import {
  COLOR_UP,
  COLOR_TEXT,
  COLOR_NONE,
  COLOR_BG_PRIMARY,
  COLOR_BG_CARD,
  COLOR_BORDER,
  COLOR_ACCENT,
  COLOR_BG_HOVER,
} from '@/lib/colors';

export function Navbar() {
  const { user } = useAuth();
  const { t, locale, setLocale, localeNames } = useT();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showAuth, setShowAuth] = useState(false);

  function handlePortfolioClick() {
    if (!user) {
      setShowAuth(true);
    } else {
      navigate('/portfolio');
    }
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: COLOR_BG_PRIMARY, borderColor: COLOR_BORDER }}
      >
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: COLOR_UP }}
              >
                <TrendingUp size={18} color="#ffffff" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                HNT<span style={{ color: COLOR_UP }}>Stock</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: pathname === '/' ? COLOR_BG_HOVER : 'transparent',
                  color: pathname === '/' ? COLOR_TEXT : COLOR_NONE,
                }}
              >
                {t('nav_market')}
              </button>
              <button
                onClick={handlePortfolioClick}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: pathname === '/portfolio' ? COLOR_BG_HOVER : 'transparent',
                  color: pathname === '/portfolio' ? COLOR_TEXT : COLOR_NONE,
                }}
              >
                {t('nav_portfolio')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Globe size={13} color={COLOR_NONE} />
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                style={{ backgroundColor: COLOR_BG_CARD, color: COLOR_NONE, border: `1px solid ${COLOR_BORDER}` }}
              >
                {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            {user ? (
              <>
                <span className="text-xs text-text-secondary hidden sm:inline truncate max-w-[160px]">
                  {user.email}
                </span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: COLOR_BG_CARD, color: COLOR_NONE, border: `1px solid ${COLOR_BORDER}` }}
                >
                  <LogOut size={13} /> {t('nav_logout')}
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: COLOR_ACCENT }}
              >
                <LogIn size={13} /> {t('nav_login')}
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
