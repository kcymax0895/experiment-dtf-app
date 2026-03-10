import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle } from 'lucide-react';
import ExperimentList from './pages/ExperimentList';
import ExperimentForm from './pages/ExperimentForm';

function BottomNav() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full ${isHome ? 'text-primary-600' : 'text-gray-500'}`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">리스트</span>
        </Link>
        <Link
          to="/new"
          className={`flex flex-col items-center justify-center w-full h-full ${!isHome ? 'text-primary-600' : 'text-gray-500'}`}
        >
          <PlusCircle size={24} />
          <span className="text-xs mt-1">새 실험</span>
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="pb-20">
        <header className="bg-primary-600 text-white p-4 sticky top-0 z-10 shadow-md">
          <h1 className="text-xl font-bold">Experiment Logger</h1>
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<ExperimentList />} />
            <Route path="/new" element={<ExperimentForm />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
