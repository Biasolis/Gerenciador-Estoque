import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import SectorsPage from './pages/SectorsPage';
import PeoplePage from './pages/PeoplePage';
import ProductsPage from './pages/ProductsPage';
import StockEntriesPage from './pages/StockEntriesPage';
import StockPage from './pages/StockPage';
import StockExitsPage from './pages/StockExitsPage';
import PrintExitPage from './pages/PrintExitPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <Routes>
      {/* Rota Pública */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* --- ESTRUTURA DE ROTAS PROTEGIDAS CORRIGIDA --- */}
      {/* Todas as rotas que exigem login ficam aninhadas aqui */}
      <Route element={<ProtectedRoute />}>

        {/* Rota de impressão (renderizada SEM o MainLayout) */}
        <Route path="/print/exit/:id" element={<PrintExitPage />} />

        {/* Rotas que usam o MainLayout (com sidebar, etc.) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/estoque" element={<StockPage />} />
          <Route path="/entradas" element={<StockEntriesPage />} />
          <Route path="/saidas" element={<StockExitsPage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/setores" element={<SectorsPage />} />
          <Route path="/pessoas" element={<PeoplePage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
        </Route>
        
      </Route>

      {/* Rota Padrão: Redireciona qualquer outra URL para a página inicial */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;