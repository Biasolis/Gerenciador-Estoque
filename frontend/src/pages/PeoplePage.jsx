import React, { useState, useEffect } from 'react'; // <-- useMemo foi removido desta linha
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import '../styles/Table.css';

function PeoplePage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useNotification();
  const [people, setPeople] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentPerson, setCurrentPerson] = useState({ id: null, name: '', email: '', extension_line: '', sector_id: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [peopleResponse, sectorsResponse] = await Promise.all([
          api.get('/people'),
          api.get('/sectors')
        ]);
        setPeople(peopleResponse.data);
        setSectors(sectorsResponse.data);
        setError('');
      } catch (err) {
        setError('Não foi possível carregar os dados.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchPeople = async () => {
     try {
        const response = await api.get('/people');
        setPeople(response.data);
      } catch (err) {
        console.error("Erro ao recarregar lista de pessoas:", err);
      }
  }

  const handleOpenModal = (type, person = null) => {
    setModalType(type);
    if (type === 'edit' && person) {
      setCurrentPerson({
        id: person.id,
        name: person.name,
        email: person.email || '',
        extension_line: person.extension_line || '',
        sector_id: person.sector_id || ''
      });
    } else {
      setCurrentPerson({ id: null, name: '', email: '', extension_line: '', sector_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPerson({ id: null, name: '', email: '', extension_line: '', sector_id: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPerson(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...currentPerson,
      sector_id: currentPerson.sector_id || null
    };

    try {
      if (modalType === 'create') {
        await api.post('/people', dataToSend);
      } else {
        await api.put(`/people/${currentPerson.id}`, dataToSend);
      }
      fetchPeople();
      handleCloseModal();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Salvar');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Tem certeza que deseja excluir este colaborador?', 'Confirmar Exclusão', async () => {
      try {
        await api.delete(`/people/${id}`);
        fetchPeople();
      } catch (err) {
        showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Excluir');
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Gestão de Pessoas</h1>
        <button className="btn btn-primary" style={{width: 'auto', padding: '0.6rem 1.2rem'}} onClick={() => handleOpenModal('create')}>
          + Adicionar Pessoa
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="table-container">
          <thead>
            <tr>
              <th>Nome do Colaborador</th>
              <th>Email</th>
              <th>Ramal</th>
              <th>Setor</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {people.map(person => (
              <tr key={person.id}>
                <td>{person.name}</td>
                <td>{person.email}</td>
                <td>{person.extension_line}</td>
                <td>{person.sector_name || 'N/A'}</td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => handleOpenModal('edit', person)}>Editar</button>
                  {user.role === 'admin' && (
                    <button className="delete-btn" onClick={() => handleDelete(person.id)}>Excluir</button>
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
        title={modalType === 'create' ? 'Adicionar Nova Pessoa' : 'Editar Pessoa'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input type="text" id="name" name="name" value={currentPerson.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={currentPerson.email} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="extension_line">Ramal</label>
            <input type="text" id="extension_line" name="extension_line" value={currentPerson.extension_line} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="sector_id">Setor</label>
            <select
              id="sector_id"
              name="sector_id"
              value={currentPerson.sector_id}
              onChange={handleInputChange}
              style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
            >
              <option value="">Selecione um setor...</option>
              {sectors.map(sector => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
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

export default PeoplePage;