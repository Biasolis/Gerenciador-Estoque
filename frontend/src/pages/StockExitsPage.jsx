import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import '../styles/Table.css';
import './StockExitsPage.css';

// Estado inicial para um item a ser adicionado
const initialItemState = {
  product_id: '',
  quantity: '',
  serial_number: '',
  asset_number: '',
  product_name: '', // Guardar nome para exibição na lista
  product_model: '' // Guardar modelo para exibição na lista
};

// Estado inicial para a ordem de saída
const initialExitState = {
  requester_person_id: '',
  ticket_number: '',
  ticket_link: '',
  reason: '',
  delivery_date: new Date().toISOString().slice(0, 10),
  items: [] // Array para guardar os itens adicionados
};

function StockExitsPage() {
  const { showAlert } = useNotification();
  const [exits, setExits] = useState([]); // Lista de ordens de saída já registradas
  const [products, setProducts] = useState([]); // Lista de produtos disponíveis
  const [people, setPeople] = useState([]); // Lista de pessoas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para a nova ordem de saída sendo criada no modal
  const [newExitData, setNewExitData] = useState(initialExitState);
  // Estado temporário para o item sendo adicionado no modal
  const [currentItem, setCurrentItem] = useState(initialItemState);
  const [availableStock, setAvailableStock] = useState(null); // Para mostrar estoque disponível

  // Busca dados iniciais (saídas, produtos, pessoas)
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [exitsRes, productsRes, peopleRes, inventoryRes] = await Promise.all([
        api.get('/stock/exits'),
        api.get('/products'),
        api.get('/people'),
        api.get('/stock/inventory') // Buscar inventário para checar estoque
      ]);
      setExits(exitsRes.data);
      setPeople(peopleRes.data);

      // Processa inventário para fácil acesso ao estoque atual
      const stockMap = inventoryRes.data.reduce((map, item) => {
        map[item.id] = item.current_stock;
        return map;
      }, {});

      // Adiciona estoque atual aos produtos
      const productsWithStock = productsRes.data.map(p => ({
        ...p,
        current_stock: stockMap[p.id] || 0
      }));
      setProducts(productsWithStock);

    } catch (err) {
      setError('Não foi possível carregar os dados. Verifique a conexão e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // Sem dependências, executa uma vez

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]); // Roda quando fetchInitialData muda (só na montagem)

  // Recarrega apenas a lista de saídas após criar uma nova
  const fetchExits = async () => {
    try {
        const response = await api.get('/stock/exits');
        setExits(response.data);
    } catch (err) {
        console.error("Erro ao recarregar lista de saídas:", err);
        showAlert('Erro ao recarregar a lista de saídas.', 'Erro');
    }
  }

  // Calcula o setor da pessoa selecionada (Memoizado)
  const selectedPersonSector = useMemo(() => {
    if (!newExitData.requester_person_id) return 'N/A';
    const selectedPerson = people.find(p => p.id === parseInt(newExitData.requester_person_id));
    return selectedPerson?.sector_name || 'Setor não vinculado';
  }, [newExitData.requester_person_id, people]);

  // Atualiza estoque disponível ao selecionar produto no modal
  useEffect(() => {
    if (currentItem.product_id) {
      const selectedProduct = products.find(p => p.id === parseInt(currentItem.product_id));
      setAvailableStock(selectedProduct?.current_stock ?? 0);
    } else {
      setAvailableStock(null);
    }
  }, [currentItem.product_id, products]);


  // Funções do Modal
  const handleOpenModal = () => {
    setNewExitData(initialExitState); // Reseta dados da ordem
    setCurrentItem(initialItemState); // Reseta item atual
    setAvailableStock(null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  // Manipula mudanças nos campos GERAIS da ordem (solicitante, ticket, etc.)
  const handleExitDataChange = (e) => {
    const { name, value } = e.target;
    setNewExitData(prev => ({ ...prev, [name]: value }));
  };

  // Manipula mudanças nos campos do ITEM ATUAL sendo adicionado
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  // Adiciona o item atual à lista de itens da ordem
  const handleAddItem = () => {
    // Validações do item
    if (!currentItem.product_id || !currentItem.quantity || parseInt(currentItem.quantity) <= 0) {
      showAlert('Selecione um produto e informe uma quantidade válida maior que zero.', 'Erro');
      return;
    }
    const quantityNum = parseInt(currentItem.quantity);
    if (availableStock === null) { // Checa se o estoque foi carregado
        showAlert('Aguarde o carregamento do estoque do produto.', 'Aviso');
        return;
    }
    if (quantityNum > availableStock) {
       showAlert(`Quantidade indisponível. Estoque atual: ${availableStock}.`, 'Erro');
       return;
    }
    // Verifica se o item (mesmo produto) já está na lista
    const existingItemIndex = newExitData.items.findIndex(item => item.product_id === currentItem.product_id);
    if (existingItemIndex > -1) {
        showAlert('Este produto já foi adicionado. Remova-o para adicionar novamente com outra quantidade/detalhes.', 'Aviso');
        return;
    }

    const selectedProduct = products.find(p => p.id === parseInt(currentItem.product_id));

    // Adiciona o item validado à lista no estado da ordem
    setNewExitData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...currentItem,
          quantity: quantityNum, // Garante que é número
          product_name: selectedProduct?.name || 'Desconhecido',
          product_model: selectedProduct?.model || 'N/M'
        }
      ]
    }));
    // Limpa os campos do item atual para adicionar outro
    setCurrentItem(initialItemState);
    setAvailableStock(null);
  };

  // Remove um item da lista de itens da ordem
  const handleRemoveItem = (indexToRemove) => {
    setNewExitData(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== indexToRemove)
    }));
  };


  // Submete a ordem de saída completa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newExitData.items.length === 0) {
      showAlert('Adicione pelo menos um produto à ordem de saída.', 'Erro');
      return;
    }
     // Validações dos campos agora obrigatórios
     if (!newExitData.requester_person_id) {
        showAlert('Selecione a pessoa solicitante.', 'Erro');
        return;
      }
    if (!newExitData.ticket_number) {
        showAlert('O campo Nº do Ticket é obrigatório.', 'Erro');
        return;
    }
     if (!newExitData.ticket_link) {
        showAlert('O campo Link do Ticket é obrigatório.', 'Erro');
        return;
    }


    try {
      // Envia os dados do cabeçalho e o array de itens
      await api.post('/stock/exits', newExitData);
      showAlert('Ordem de Saída registrada com sucesso!', 'Sucesso');
      fetchExits(); // Recarrega a lista de saídas na página
      fetchInitialData(); // Recarrega produtos/estoque (importante!)
      handleCloseModal();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Erro de conexão', 'Erro ao Registrar Saída');
    }
  };

  // Função de impressão (inalterada)
  const handlePrint = (exitId) => {
    const printUrl = `/print/exit/${exitId}`;
    window.open(printUrl, '_blank', 'width=800,height=600');
  }

  // Formatação de data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', options);
  };
   const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', options);
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
              <th>OS Nº</th>
              <th>Solicitante</th>
              <th>Setor</th>
              <th>Nº Ticket</th>
              <th>Data Entrega</th>
              <th>Itens (Qtde)</th>
              <th>Data Registro</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {exits.map(exit => (
              <tr key={exit.id}>
                <td>{String(exit.id).padStart(6, '0')}</td>
                <td>{exit.requester_name || 'N/A'}</td>
                <td>{exit.sector_name || 'N/A'}</td>
                <td>{exit.ticket_number || 'N/A'}</td>
                <td>{formatDate(exit.delivery_date)}</td>
                <td>{exit.distinct_items_count || 0} ({exit.total_quantity || 0})</td>
                 <td>{formatDateTime(exit.created_at)}</td>
                <td className="actions-cell">
                   <button className="edit-btn" style={{backgroundColor: '#17a2b8', color: 'white'}} onClick={() => handlePrint(exit.id)}>Imprimir</button>
                </td>
              </tr>
            ))}
            {exits.length === 0 && (
                <tr><td colSpan="8" style={{textAlign: 'center'}}>Nenhuma ordem de saída registrada.</td></tr>
            )}
          </tbody>
        </table>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Registrar Nova Ordem de Saída">
        <form onSubmit={handleSubmit}>

          {/* --- Seção Dados Gerais da Ordem --- */}
          <h4>Dados Gerais</h4>
          <div className="form-grid-container" style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
            <div className="form-group">
              <label>Pessoa Solicitante *</label>
              <select name="requester_person_id" value={newExitData.requester_person_id} onChange={handleExitDataChange} required style={{width: '100%', padding: '0.75rem'}}>
                <option value="">Selecione...</option>
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
              <label>Data de Entrega *</label>
              <input type="date" name="delivery_date" value={newExitData.delivery_date} onChange={handleExitDataChange} required />
            </div>
             <div className="form-group">
              <label>Nº do Ticket *</label>
              <input type="text" name="ticket_number" value={newExitData.ticket_number} onChange={handleExitDataChange} required />
            </div>
             <div className="form-group grid-col-span-2">
              <label>Link do Ticket *</label>
              <input type="text" name="ticket_link" value={newExitData.ticket_link} onChange={handleExitDataChange} required />
            </div>
             <div className="form-group grid-col-span-2">
              <label>Motivo da Solicitação</label>
              <textarea name="reason" rows="2" value={newExitData.reason} onChange={handleExitDataChange}></textarea>
            </div>
          </div>

          {/* --- Seção Adicionar Itens --- */}
          <h4>Adicionar Itens</h4>
          <div className="add-item-section">
            <div className="form-group item-product">
              <label>Produto *</label>
              {/* REMOVIDO 'required' */}
              <select name="product_id" value={currentItem.product_id} onChange={handleItemChange} style={{width: '100%', padding: '0.75rem'}}>
                <option value="">Selecione...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.current_stock <= 0}>
                    {p.name} ({p.model || 'N/M'}) - Estoque: {p.current_stock}
                  </option>
                ))}
              </select>
            </div>
             <div className="form-group item-quantity">
              <label>Qtde *</label>
               {/* REMOVIDO 'required' */}
              <input
                type="number"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleItemChange}
                min="1"
                max={availableStock ?? undefined}
                placeholder={availableStock !== null ? `Max: ${availableStock}` : ''}
              />
            </div>
            <div className="form-group item-serial">
              <label>Nº Série</label>
              <input type="text" name="serial_number" value={currentItem.serial_number} onChange={handleItemChange} />
            </div>
            <div className="form-group item-asset">
              <label>Patrimônio</label>
              <input type="text" name="asset_number" value={currentItem.asset_number} onChange={handleItemChange} />
            </div>
            <div className="item-add-button">
              <button type="button" className="btn btn-secondary" onClick={handleAddItem} disabled={!currentItem.product_id || !currentItem.quantity}>
                Adicionar Item +
              </button>
            </div>
          </div>

          {/* --- Seção Itens Adicionados --- */}
          {newExitData.items.length > 0 && (
            <div className="items-added-section">
              <h4>Itens Adicionados</h4>
              <table className="items-added-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Qtde</th>
                    <th>Nº Série</th>
                    <th>Patrimônio</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {newExitData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name} ({item.product_model})</td>
                      <td>{item.quantity}</td>
                      <td>{item.serial_number || '-'}</td>
                      <td>{item.asset_number || '-'}</td>
                      <td>
                        <button type="button" className="delete-item-btn" onClick={() => handleRemoveItem(index)}>
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* --- Rodapé do Modal --- */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={newExitData.items.length === 0}>
              Registrar Saída Completa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default StockExitsPage;