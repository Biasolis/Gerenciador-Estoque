import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import '../styles/Table.css';

function SectorsPage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useNotification();
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentSector, setCurrentSector] = useState({ id: null, name: '', description: '' });

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sectors');
      setSectors(response.data);
      setError('');
    } catch (err) {
      setError('Não foi possível carregar os setores.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, sector = null) => {
    setModalType(type);
    if (type === 'edit' && sector) {
      setCurrentSector(sector);
    } else {
      setCurrentSector({ id: null, name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSector({ id: null, name: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSector(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/sectors', { name: currentSector.name, description: currentSector.description });
      } else {
        await api.put(`/sectors/${currentSector.id}`, { name: currentSector.name, description: currentSector.description });
      }
      fetchSectors();
      handleCloseModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erro de conexão';
      showAlert(errorMsg, 'Erro ao Salvar');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Tem certeza que deseja excluir este setor?', 'Confirmar Exclusão', async () => {
      try {
        await api.delete(`/sectors/${id}`);
        fetchSectors();
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Erro de conexão';
        showAlert(errorMsg, 'Erro ao Excluir');
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Gestão de Setores</h1>
        <button className="btn btn-primary" style={{width: 'auto', padding: '0.6rem 1.2rem'}} onClick={() => handleOpenModal('create')}>
          + Adicionar Setor
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="table-container">
          <thead>
            <tr>
              <th>Nome do Setor</th>
              <th>Descrição</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sectors.map(sector => (
              <tr key={sector.id}>
                <td>{sector.name}</td>
                <td>{sector.description}</td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => handleOpenModal('edit', sector)}>Editar</button>
                  {user.role === 'admin' && (
                    <button className="delete-btn" onClick={() => handleDelete(sector.id)}>Excluir</button>
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
        title={modalType === 'create' ? 'Adicionar Novo Setor' : 'Editar Setor'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome do Setor</label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentSector.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
              value={currentSector.description}
              onChange={handleInputChange}
            ></textarea>
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

export default SectorsPage;