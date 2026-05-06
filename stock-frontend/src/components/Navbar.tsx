import { TrendingUp } from 'lucide-react';

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: '#0d0e11', borderColor: '#2a2b2e' }}
    >
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
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
        <span className="text-xs text-[#858ca2]">Powered by Group 7</span>
      </div>
    </nav>
  );
}
