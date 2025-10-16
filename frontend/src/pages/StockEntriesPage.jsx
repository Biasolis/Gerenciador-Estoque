import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import '../styles/Table.css';

function StockEntriesPage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useNotification();
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    product_id: '',
    quantity: '',
    unit_value: '',
    entry_date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [entriesResponse, productsResponse] = await Promise.all([
        api.get('/stock/entries'),
        api.get('/products')
      ]);
      setEntries(entriesResponse.data);
      setProducts(productsResponse.data);
      setError('');
    } catch (err) {
      setError('Não foi possível carregar os dados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEntries = async () => {
      try {
        const response = await api.get('/stock/entries');
        setEntries(response.data);
      } catch (err) {
        console.error("Erro ao recarregar lista de entradas:", err);
      }
  }

  const handleOpenModal = () => {
    setNewEntry({
      product_id: '',
      quantity: '',
      unit_value: '',
      entry_date: new Date().toISOString().slice(0, 10)
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock/entries', newEntry);
      fetchEntries();
      handleCloseModal();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Registrar');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Excluir este registro de entrada? Esta ação não pode ser desfeita.', 'Confirmar Exclusão', async () => {
      try {
        await api.delete(`/stock/entries/${id}`);
        fetchEntries();
      } catch (err) {
        showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Excluir');
      }
    });
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Registros de Entrada no Estoque</h1>
        <button className="btn btn-primary" style={{width: 'auto', padding: '0.6rem 1.2rem'}} onClick={handleOpenModal}>
          + Nova Entrada
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="table-container">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Modelo</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Data de Entrada</th>
              <th>Registrado por</th>
              {user.role === 'admin' && <th className="actions-cell">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.product_name}</td>
                <td>{entry.product_model}</td>
                <td>{entry.quantity}</td>
                <td>{`R$ ${parseFloat(entry.unit_value).toFixed(2).replace('.', ',')}`}</td>
                <td>{formatDate(entry.entry_date)}</td>
                <td>{entry.user_name}</td>
                {user.role === 'admin' && (
                  <td className="actions-cell">
                    <button className="delete-btn" onClick={() => handleDelete(entry.id)}>Excluir</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Registrar Nova Entrada de Produto">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="product_id">Produto</label>
            <select id="product_id" name="product_id" value={newEntry.product_id} onChange={handleInputChange} required style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}>
              <option value="">Selecione um produto...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name} ({product.model || 'Sem modelo'})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantidade</label>
            <input type="number" id="quantity" name="quantity" value={newEntry.quantity} onChange={handleInputChange} required min="1" />
          </div>
          <div className="form-group">
            <label htmlFor="unit_value">Valor Pago por Unidade (R$)</label>
            <input type="number" id="unit_value" name="unit_value" value={newEntry.unit_value} onChange={handleInputChange} required min="0" step="0.01" />
          </div>
           <div className="form-group">
            <label htmlFor="entry_date">Data de Entrada</label>
            <input type="date" id="entry_date" name="entry_date" value={newEntry.entry_date} onChange={handleInputChange} required />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar Entrada</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default StockEntriesPage;