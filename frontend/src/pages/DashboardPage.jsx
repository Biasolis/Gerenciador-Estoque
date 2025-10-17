import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './DashboardPage.css';
import '../styles/Table.css'; // Reutilizamos alguns estilos
import TopSetoresChart from '../../components/dashboard/TopSetoresChart';

function DashboardPage() {
  const [summary, setSummary] = useState({ totalItems: 0, lowStockItems: [] });
  const [topItems, setTopItems] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: new Date().toISOString().slice(0, 10), // Hoje
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTopItems, setLoadingTopItems] = useState(true);

  useEffect(() => {
    fetchSummary();
    fetchTopMovingItems();
  }, []); // Roda na montagem inicial

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const response = await api.get('/reports/dashboard-summary');
      setSummary(response.data);
    } catch (error) {
      console.error("Erro ao buscar resumo do dashboard:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchTopMovingItems = async () => {
    try {
      setLoadingTopItems(true);
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/reports/top-moving-items?${queryParams}`);
      setTopItems(response.data);
    } catch (error) {
      console.error("Erro ao buscar itens com maior saída:", error);
    } finally {
      setLoadingTopItems(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFilterSubmit = () => {
    fetchTopMovingItems();
  }

  const getStockStatusClass = (quantity) => {
    if (quantity <= 0) return 'stock-out';
    if (quantity <= 1) return 'stock-low';
    return 'stock-ok';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="dashboard-grid">
        {/* Card: Total de Itens */}
        <div className="dashboard-card">
          <div className="card-header"><h3 className="card-title">Visão Geral do Estoque</h3></div>
          <div className="card-content">
            {loadingSummary ? <p>Carregando...</p> : (
              <>
                <p className="value">{summary.totalItems}</p>
                <p className="label">Itens totais em estoque</p>
              </>
            )}
          </div>
        </div>

        {/* Card: Alerta de Estoque Baixo */}
        <div className="dashboard-card">
          <div className="card-header"><h3 className="card-title">Alerta de Estoque Baixo</h3></div>
          <div className="card-content">
            {loadingSummary ? <p>Carregando...</p> : (
              summary.lowStockItems.length > 0 ? (
                <table className="low-stock-table">
                  <tbody>
                    {summary.lowStockItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.name} ({item.model || 'N/M'})</td>
                        <td className={`stock-quantity ${getStockStatusClass(item.current_stock)}`}>
                          {item.current_stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>Nenhum item com estoque baixo.</p>
            )}
          </div>
        </div>
        
        {/* Card: Itens com Maior Saída */}
        <div className="dashboard-card full-width">
          <div className="card-header">
            <h3 className="card-title">Top 5 Produtos com Maior Saída</h3>
            <div className="card-filters">
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                <span>até</span>
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                <button className="btn btn-primary" style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem'}} onClick={handleFilterSubmit}>Aplicar</button>
            </div>
          </div>
          <div className="card-content">
             {loadingTopItems ? <p>Carregando...</p> : (
               topItems.length > 0 ? (
                <table className="table-container">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Modelo</th>
                      <th>Total de Saídas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.model || 'N/A'}</td>
                        <td>{item.total_exited}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               ) : <p>Nenhuma saída registrada no período.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;