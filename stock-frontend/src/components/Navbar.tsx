import { useState } from 'react';
import { TrendingUp, LogOut, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/usePortfolio';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  tab: 'market' | 'portfolio';
  onTabChange: (t: 'market' | 'portfolio') => void;
}

export function Navbar({ tab, onTabChange }: NavbarProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  function handlePortfolioClick() {
    if (!user) {
      setShowAuth(true);
    } else {
      onTabChange('portfolio');
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

            {/* Nav tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onTabChange('market')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: tab === 'market' ? '#22232a' : 'transparent',
                  color: tab === 'market' ? '#fff' : '#858ca2',
                }}
              >
                Thị trường
              </button>
              <button
                onClick={handlePortfolioClick}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: tab === 'portfolio' ? '#22232a' : 'transparent',
                  color: tab === 'portfolio' ? '#fff' : '#858ca2',
                }}
              >
                Danh mục
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
                  <LogOut size={13} /> Đăng xuất
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: '#3861fb' }}
              >
                <LogIn size={13} /> Đăng nhập
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
