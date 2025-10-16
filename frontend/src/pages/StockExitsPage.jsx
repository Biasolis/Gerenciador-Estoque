import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import '../styles/Table.css';

function StockExitsPage() {
  const { showAlert } = useNotification();
  const [exits, setExits] = useState([]);
  const [products, setProducts] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExit, setNewExit] = useState({
    product_id: '',
    quantity: '',
    requester_person_id: '',
    ticket_number: '',
    ticket_link: '',
    reason: '',
    delivery_date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const selectedPersonSector = useMemo(() => {
    if (!newExit.requester_person_id) return 'Selecione um solicitante acima';
    const selectedPerson = people.find(p => p.id === parseInt(newExit.requester_person_id));
    return selectedPerson?.sector_name || 'Setor não vinculado';
  }, [newExit.requester_person_id, people]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [exitsRes, productsRes, peopleRes] = await Promise.all([
        api.get('/stock/exits'),
        api.get('/products'),
        api.get('/people')
      ]);
      setExits(exitsRes.data);
      setProducts(productsRes.data);
      setPeople(peopleRes.data);
      setError('');
    } catch (err) {
      setError('Não foi possível carregar os dados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExits = async () => {
    try {
        const response = await api.get('/stock/exits');
        setExits(response.data);
    } catch (err) {
        console.error("Erro ao recarregar lista de saídas:", err);
    }
  }

  const handleOpenModal = () => {
    setNewExit({
      product_id: '', quantity: '', requester_person_id: '',
      ticket_number: '', ticket_link: '', reason: '',
      delivery_date: new Date().toISOString().slice(0, 10)
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExit(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock/exits', newExit);
      fetchExits();
      handleCloseModal();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Registrar Saída');
    }
  };
  
  const handlePrint = (exitId) => {
    const printUrl = `/print/exit/${exitId}`;
    window.open(printUrl, '_blank', 'width=800,height=600');
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Registros de Saída (Ordens de Serviço)</h1>
        <button className="btn btn-primary" style={{width: 'auto', padding: '0.6rem 1.2rem'}} onClick={handleOpenModal}>
          + Nova Saída
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="table-container">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtde.</th>
              <th>Solicitante</th>
              <th>Setor</th>
              <th>Nº Ticket</th>
              <th>Data Entrega</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {exits.map(exit => (
              <tr key={exit.id}>
                <td>{exit.product_name}</td>
                <td>{exit.quantity}</td>
                <td>{exit.requester_name}</td>
                <td>{exit.sector_name || 'N/A'}</td>
                <td>{exit.ticket_number || 'N/A'}</td>
                <td>{formatDate(exit.delivery_date)}</td>
                <td className="actions-cell">
                   <button className="edit-btn" style={{backgroundColor: '#17a2b8'}} onClick={() => handlePrint(exit.id)}>Imprimir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Registrar Nova Saída de Produto">
        <form onSubmit={handleSubmit}>
          <div className="form-grid-container">
            <div className="form-group grid-col-span-2">
              <label>Produto</label>
              <select name="product_id" value={newExit.product_id} onChange={handleInputChange} required style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}>
                <option value="">Selecione um produto...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model || 'N/M'})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Pessoa Solicitante</label>
              <select name="requester_person_id" value={newExit.requester_person_id} onChange={handleInputChange} required style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}>
                <option value="">Selecione o solicitante...</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Setor Solicitante</label>
              <div className="readonly-field">
                {selectedPersonSector}
              </div>
            </div>

            <div className="form-group">
              <label>Quantidade</label>
              <input type="number" name="quantity" value={newExit.quantity} onChange={handleInputChange} required min="1" />
            </div>
            
            <div className="form-group">
              <label>Data de Entrega</label>
              <input type="date" name="delivery_date" value={newExit.delivery_date} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Nº do Ticket</label>
              <input type="text" name="ticket_number" value={newExit.ticket_number} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Link do Ticket</label>
              <input type="text" name="ticket_link" value={newExit.ticket_link} onChange={handleInputChange} />
            </div>
            
            <div className="form-group grid-col-span-2">
              <label>Motivo da Solicitação</label>
              <textarea name="reason" rows="3" value={newExit.reason} onChange={handleInputChange} style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Registrar Saída</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default StockExitsPage;