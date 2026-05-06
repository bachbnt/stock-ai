import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Navbar } from './components/Navbar';
import { StockTable } from './components/StockTable';
import './index.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dark min-h-screen" style={{ backgroundColor: '#0d0e11' }}>
        <Navbar />
        <main>
          <StockTable />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
