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
import ProfilePage from './pages/ProfilePage'; // <-- 1. Importa a nova página

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/print/exit/:id" element={<PrintExitPage />} />

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
          {/* ============================================ */}
          {/* !! NOVA ROTA !!                             */}
          <Route path="/perfil" element={<ProfilePage />} /> {/* 2. Adiciona a rota */}
          {/* ============================================ */}
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;