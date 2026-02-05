
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import BudgetList from './pages/BudgetList';
import BudgetEditor from './pages/BudgetEditor';
import Settings from './pages/Settings';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/budgets" replace />} />
            <Route path="budgets" element={<BudgetList />} />
            <Route path="budgets/new" element={<BudgetEditor />} />
            <Route path="budgets/:id" element={<BudgetEditor />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
