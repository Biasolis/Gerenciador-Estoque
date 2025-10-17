import React, { useState, useEffect } from 'react';
// ============================================
// !! CORREÇÃO AQUI !!
// Remove 'user' da desestruturação
import { useAuth } from '../contexts/AuthContext';
// ============================================
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import './ProfilePage.css';

function ProfilePage() {
  // ============================================
  // !! CORREÇÃO AQUI !!
  // Remove 'user' da desestruturação
  const { token, setUser } = useAuth(); // Pega apenas token e setUser
  // ============================================
  const { showAlert } = useNotification();

  // Estado para dados do perfil
  const [profileData, setProfileData] = useState({ name: '', nickname: '', email: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');

  // Estado para formulário de troca de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Busca dados do perfil ao carregar a página
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError('');
        const response = await api.get('/profile/me');
        setProfileData({
          name: response.data.name || '',
          nickname: response.data.nickname || '',
          email: response.data.email || ''
        });
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setProfileError('Não foi possível carregar os dados do perfil.');
        showAlert('Não foi possível carregar os dados do perfil.', 'Erro');
      } finally {
        setLoadingProfile(false);
      }
    };
    if (token) {
        fetchProfile();
    } else {
        setLoadingProfile(false);
        setProfileError('Usuário não autenticado.');
    }
  }, [token, showAlert]);

  // Handler para mudanças nos campos do perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handler para submeter atualização do perfil
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    try {
      const response = await api.put('/profile/me', {
        name: profileData.name,
        nickname: profileData.nickname
      });
      // Atualiza o estado local e o contexto de autenticação
      setProfileData(prev => ({ ...prev, name: response.data.name, nickname: response.data.nickname }));
      // Atualiza o user no AuthContext para refletir na Sidebar imediatamente
      // Usamos os dados da resposta para garantir consistência
      setUser(prevUser => ({
          ...prevUser, // Mantém id, role, etc.
          name: response.data.name,
          nickname: response.data.nickname
       }));
      showAlert('Perfil atualizado com sucesso!', 'Sucesso');
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      const msg = err.response?.data?.message || 'Erro ao atualizar perfil.';
      setProfileError(msg);
      showAlert(msg, 'Erro');
    }
  };

  // Handler para mudanças nos campos de senha
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Handler para submeter alteração de senha
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setLoadingPassword(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('A nova senha e a confirmação não coincidem.');
      setLoadingPassword(false);
      return;
    }
     if (passwordData.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      setLoadingPassword(false);
      return;
    }


    try {
      const response = await api.put('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      setPasswordSuccess(response.data.message);
      showAlert(response.data.message, 'Sucesso');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error("Erro ao alterar senha:", err);
      const msg = err.response?.data?.message || 'Erro ao alterar senha.';
      setPasswordError(msg);
      showAlert(msg, 'Erro');
    } finally {
      setLoadingPassword(false);
    }
  };


  if (loadingProfile) {
    return <div>Carregando perfil...</div>;
  }

  return (
    <div className="profile-page-container">
      <h1>Meu Perfil</h1>

      {/* Formulário de Dados Básicos */}
      <section className="profile-section">
        <h2>Dados Pessoais</h2>
        {profileError && <p className="error-message">{profileError}</p>}
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label htmlFor="name">Nome Completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="nickname">Apelido (Exibição)</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={profileData.nickname || ''} // Garante que value não seja null/undefined
              onChange={handleProfileChange}
              placeholder="Como você quer ser chamado"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email (Não editável)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              readOnly
              disabled
              style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Salvar Alterações
          </button>
        </form>
      </section>

      {/* Formulário de Alteração de Senha */}
      <section className="profile-section">
        <h2>Alterar Senha</h2>
        {passwordError && <p className="error-message">{passwordError}</p>}
        {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Senha Atual *</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Nova Senha *</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nova Senha *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loadingPassword}>
            {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;