import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { I18nProvider } from './contexts/I18nContext';
import { Navbar } from './components/Navbar';
import { StockTable } from './components/StockTable';
import { Portfolio } from './components/portfolio/Portfolio';
import { useAuth } from './hooks/usePortfolio';
import './index.css';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-screen" style={{ backgroundColor: '#0d0e11' }}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><StockTable /></Layout>,
  },
  {
    path: '/portfolio',
    element: (
      <Layout>
        <ProtectedRoute>
          <Portfolio />
        </ProtectedRoute>
      </Layout>
    ),
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
