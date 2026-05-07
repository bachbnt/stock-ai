import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Navbar } from './components/Navbar';
import { StockTable } from './components/StockTable';
import { Portfolio } from './components/portfolio/Portfolio';
import { useAuth } from './hooks/usePortfolio';
import './index.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<'market' | 'portfolio'>('market');

  useEffect(() => {
    if (!loading && !user && tab === 'portfolio') {
      setTab('market');
    }
  }, [user, loading, tab]);

  function handleTabChange(t: 'market' | 'portfolio') {
    if (t === 'portfolio' && !user) return;
    setTab(t);
  }

  return (
    <div className="dark min-h-screen" style={{ backgroundColor: '#0d0e11' }}>
      <Navbar tab={tab} onTabChange={handleTabChange} />
      <main>
        {tab === 'market' ? <StockTable /> : <Portfolio />}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
