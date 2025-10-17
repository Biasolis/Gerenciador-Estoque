import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';
import logo from '../../assets/images/logo.png';

function Sidebar() {
  const { user, logout } = useAuth();

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

  // Adiciona o link de perfil dinamicamente se o usuário estiver logado
  const profileLink = user ? [{ path: '/perfil', label: 'Meu Perfil' }] : [];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <img src={logo} alt="Consórcio Magalu Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        <ul>
          {/* Links Comuns */}
          {commonLinks.map(link => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                // Aplica classe 'active' apenas se for a rota exata (exceto Dashboard '/')
                className={({ isActive }) => isActive ? 'active' : ''}
                end={link.path !== '/'} // 'end' para correspondência exata, exceto '/'
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {/* Links Admin */}
          {user?.role === 'admin' && adminLinks.map(link => (
            <li key={link.path}>
              <NavLink
                 to={link.path}
                 className={({ isActive }) => isActive ? 'active' : ''}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {/* ============================================ */}
          {/* !! NOVO LINK DE PERFIL !!                   */}
           {profileLink.map(link => (
            <li key={link.path} style={{ marginTop: '1rem', borderTop: '1px solid #4a5568', paddingTop: '1rem' }}> {/* Estilo para separar */}
              <NavLink
                 to={link.path}
                 className={({ isActive }) => isActive ? 'active' : ''}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {/* ============================================ */}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          {/* Prioriza nickname, depois name */}
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