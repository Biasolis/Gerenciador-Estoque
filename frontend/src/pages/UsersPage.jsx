import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import '../styles/Table.css';

function UsersPage() {
  const { user: loggedInUser } = useAuth();
  const { showAlert, showConfirm } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentUser, setCurrentUser] = useState({ 
    id: null, name: '', email: '', password: '', role: 'user', is_active: true 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Não foi possível carregar os usuários.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, user = null) => {
    setModalType(type);
    if (type === 'edit' && user) {
      setCurrentUser({ ...user, password: '' });
    } else {
      setCurrentUser({ id: null, name: '', email: '', password: '', role: 'user', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentUser(prevState => ({ 
      ...prevState, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...currentUser };
    if (modalType === 'edit' && !dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      if (modalType === 'create') {
        await api.post('/users', dataToSend);
      } else {
        await api.put(`/users/${currentUser.id}`, dataToSend);
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Salvar');
    }
  };

  const handleDelete = async (userId) => {
    showConfirm('Tem certeza que deseja excluir este usuário?', 'Confirmar Exclusão', async () => {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (err) {
        showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Excluir');
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Gestão de Usuários</h1>
        <button className="btn btn-primary" style={{width: 'auto', padding: '0.6rem 1.2rem'}} onClick={() => handleOpenModal('create')}>
          + Adicionar Usuário
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="table-container">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Status</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name} {user.id === loggedInUser.id && '(Você)'}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => handleOpenModal('edit', user)}>Editar</button>
                  {user.id !== loggedInUser.id && (
                    <button className="delete-btn" onClick={() => handleDelete(user.id)}>Excluir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={modalType === 'create' ? 'Adicionar Novo Usuário' : 'Editar Usuário'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input type="text" name="name" value={currentUser.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={currentUser.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" name="password" value={currentUser.password} onChange={handleInputChange} placeholder={modalType === 'edit' ? 'Deixe em branco para não alterar' : ''} required={modalType === 'create'} />
          </div>
          <div className="form-group">
            <label>Tipo de Usuário</label>
            <select name="role" value={currentUser.role} onChange={handleInputChange} style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" id="is_active" name="is_active" checked={currentUser.is_active} onChange={handleInputChange} style={{ width: 'auto', marginRight: '10px' }} />
            <label htmlFor="is_active" style={{ marginBottom: 0 }}>Usuário Ativo</label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UsersPage;