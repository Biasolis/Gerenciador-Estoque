import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import '../styles/Table.css';

function StockPage() {
  const { user } = useAuth();
  const { showAlert } = useNotification();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o modal de ajuste
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [itemToAdjust, setItemToAdjust] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({ new_quantity: '', reason: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stock/inventory');
      setInventory(response.data);
      setError('');
    } catch (err) {
      setError('Não foi possível carregar o inventário.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjustModal = (item) => {
    setItemToAdjust(item);
    setAdjustmentData({ new_quantity: item.current_stock, reason: '' });
    setIsAdjustModalOpen(true);
  };

  const handleCloseAdjustModal = () => {
    setIsAdjustModalOpen(false);
    setItemToAdjust(null);
  };

  const handleAdjustmentChange = (e) => {
    const { name, value } = e.target;
    setAdjustmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock/adjust', {
        product_id: itemToAdjust.id,
        new_quantity: adjustmentData.new_quantity,
        reason: adjustmentData.reason
      });
      showAlert('Estoque ajustado com sucesso!', 'Sucesso');
      handleCloseAdjustModal();
      fetchInventory(); // Atualiza a lista
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erro ao ajustar estoque.', 'Erro');
    }
  };

  const getStockStatusClass = (quantity) => {
    if (quantity <= 0) return 'stock-out';
    if (quantity <= 5) return 'stock-low';
    return 'stock-ok';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Estoque Atual</h1>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="table-container">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Modelo</th>
              <th>Quantidade em Estoque</th>
              {user.role === 'admin' && <th className="actions-cell">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.model || 'N/A'}</td>
                <td>
                  <span className={getStockStatusClass(item.current_stock)}>
                    {item.current_stock}
                  </span>
                </td>
                {user.role === 'admin' && (
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => handleOpenAdjustModal(item)}>Ajustar</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de Ajuste de Estoque */}
      {itemToAdjust && (
        <Modal isOpen={isAdjustModalOpen} onClose={handleCloseAdjustModal} title={`Ajustar Estoque de: ${itemToAdjust.name}`}>
          <form onSubmit={handleAdjustSubmit}>
            <div className="form-group">
              <label>Quantidade Atual</label>
              <input type="text" value={itemToAdjust.current_stock} readOnly disabled />
            </div>
            <div className="form-group">
              <label htmlFor="new_quantity">Nova Quantidade</label>
              <input type="number" id="new_quantity" name="new_quantity" value={adjustmentData.new_quantity} onChange={handleAdjustmentChange} required min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="reason">Motivo do Ajuste</label>
              <textarea id="reason" name="reason" rows="3" value={adjustmentData.reason} onChange={handleAdjustmentChange} required style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}></textarea>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseAdjustModal}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Ajuste</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default StockPage;