import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, LogOut, LogIn, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/usePortfolio';
import { useT } from '../contexts/I18nContext';
import type { Locale } from '../lib/i18n';
import { AuthModal } from './AuthModal';

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
        style={{ backgroundColor: '#0d0e11', borderColor: '#2a2b2e' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#16c784' }}
              >
                <TrendingUp size={18} color="#ffffff" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                HNT<span style={{ color: '#16c784' }}>Stock</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: pathname === '/' ? '#22232a' : 'transparent',
                  color: pathname === '/' ? '#fff' : '#858ca2',
                }}
              >
                {t('nav_market')}
              </button>
              <button
                onClick={handlePortfolioClick}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: pathname === '/portfolio' ? '#22232a' : 'transparent',
                  color: pathname === '/portfolio' ? '#fff' : '#858ca2',
                }}
              >
                {t('nav_portfolio')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Globe size={13} color="#858ca2" />
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                style={{ backgroundColor: '#1a1b1e', color: '#858ca2', border: '1px solid #2a2b2e' }}
              >
                {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            {user ? (
              <>
                <span className="text-xs text-[#858ca2] hidden sm:inline truncate max-w-[160px]">
                  {user.email}
                </span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: '#1a1b1e', color: '#858ca2', border: '1px solid #2a2b2e' }}
                >
                  <LogOut size={13} /> {t('nav_logout')}
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: '#3861fb' }}
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
