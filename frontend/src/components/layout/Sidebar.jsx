import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';
import logo from '../../assets/images/logo.png'; // <-- 1. Importa o logo

function Sidebar() {
  const { user, logout } = useAuth();

  // Mantém a lógica de links dinâmicos
  const commonLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/estoque', label: 'Estoque' },
    { path: '/entradas', label: 'Entrada de Itens' },
    { path: '/saidas', label: 'Saída de Itens' },
    { path: '/produtos', label: 'Produtos' },
    { path: '/setores', label: 'Setores' },
    { path: '/pessoas', label: 'Pessoas' },
  ];

  const adminLinks = [
    { path: '/relatorios', label: 'Relatórios' },
    { path: '/usuarios', label: 'Usuários' },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        {/* 2. Adiciona a imagem do logo */}
        <img src={logo} alt="Consórcio Magalu Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        <ul>
          {commonLinks.map(link => (
            <li key={link.path}>
              <NavLink to={link.path} end>
                {link.label}
              </NavLink>
            </li>
          ))}
          {user?.role === 'admin' && adminLinks.map(link => (
            <li key={link.path}>
              <NavLink to={link.path}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          {/* Mantém as informações do usuário dinâmicas */}
          <span className="user-name">{user?.nickname || user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button onClick={logout} className="logout-button">
          Sair
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;