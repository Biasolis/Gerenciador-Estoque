import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './MainLayout.css';

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="content-area">
        {/* O <Outlet> é um placeholder do React Router 
            onde a rota filha correspondente será renderizada */}
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;