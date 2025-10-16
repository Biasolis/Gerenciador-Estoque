import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';
import logo from '/src/assets/images/logo.png'; // <-- 1. Importa o logo

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <div className="login-page-container">
      <div className="form-container">
        {/* 2. Adiciona a imagem do logo aqui */}
        <img src={logo} alt="Consórcio Magalu Logo" className="login-logo" />

        <h2>Controle de Estoque</h2>
        <p>Por favor, entre com suas credenciais</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu.email@empresa.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;