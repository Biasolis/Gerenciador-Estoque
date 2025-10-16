import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import '../styles/Table.css';

function ProductsPage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentProduct, setCurrentProduct] = useState({ id: null, name: '', model: '', description: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Não foi possível carregar os produtos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, product = null) => {
    setModalType(type);
    if (type === 'edit' && product) {
      setCurrentProduct(product);
    } else {
      setCurrentProduct({ id: null, name: '', model: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct({ id: null, name: '', model: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/products', currentProduct);
      } else {
        await api.put(`/products/${currentProduct.id}`, currentProduct);
      }
      fetchProducts();
      handleCloseModal();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Salvar');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Tem certeza que deseja excluir este produto?', 'Confirmar Exclusão', async () => {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Excluir');
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Gestão de Produtos</h1>
        <button className="btn btn-primary" style={{width: 'auto', padding: '0.6rem 1.2rem'}} onClick={() => handleOpenModal('create')}>
          + Adicionar Produto
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="table-container">
          <thead>
            <tr>
              <th>Nome do Produto</th>
              <th>Modelo</th>
              <th>Descrição</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.model}</td>
                <td>{product.description}</td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => handleOpenModal('edit', product)}>Editar</button>
                  {user.role === 'admin' && (
                    <button className="delete-btn" onClick={() => handleDelete(product.id)}>Excluir</button>
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
        title={modalType === 'create' ? 'Adicionar Novo Produto' : 'Editar Produto'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome do Produto</label>
            <input type="text" id="name" name="name" value={currentProduct.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="model">Modelo</label>
            <input type="text" id="model" name="model" value={currentProduct.model} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
              value={currentProduct.description}
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

export default ProductsPage;