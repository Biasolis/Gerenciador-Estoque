import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './DashboardPage.css';
import '../styles/Table.css';
import TopSetoresChart from '../components/dashboard/TopSetoresChart';
import TopRequestersList from '../components/dashboard/TopRequestersList'; // Importa a lista

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: new Date().toISOString().slice(0, 10),
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTopItems, setLoadingTopItems] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [topItemsError, setTopItemsError] = useState(null);

  useEffect(() => {
    fetchSummary();
    fetchTopMovingItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSummary = async () => {
     try {
      setLoadingSummary(true);
      setSummaryError(null);
      const response = await api.get('/reports/dashboard-summary');
      setSummary({
        totalItems: response.data.totalItems || 0,
        lowStockItems: Array.isArray(response.data.lowStockItems) ? response.data.lowStockItems : []
      });
    } catch (error) {
      console.error("Erro ao buscar resumo do dashboard:", error);
      setSummaryError("Não foi possível carregar o resumo do estoque.");
      setSummary({ totalItems: 0, lowStockItems: [] });
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchTopMovingItems = async () => {
    try {
      setLoadingTopItems(true);
      setTopItemsError(null);
      const activeFilters = Object.entries(filters)
        .filter(([, value]) => value)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const queryParams = new URLSearchParams(activeFilters).toString();
      const response = await api.get(`/reports/top-moving-items?${queryParams}`);
      setTopItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao buscar itens com maior saída:", error);
      setTopItemsError("Não foi possível carregar os itens com maior saída.");
      setTopItems([]);
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

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Card: Visão Geral do Estoque */}
        <div className="dashboard-card">
          <div className="card-header"><h3 className="card-title">Visão Geral do Estoque</h3></div>
          <div className="card-content">
            {loadingSummary ? <p>Carregando...</p> : summaryError ? <p className="error-message">{summaryError}</p> :(
              <>
                <p className="value">{summary?.totalItems ?? 0}</p>
                <p className="label">Itens totais em estoque</p>
              </>
            )}
          </div>
        </div>

        {/* Card: Alerta de Estoque Baixo */}
        <div className="dashboard-card">
          <div className="card-header"><h3 className="card-title">Alerta de Estoque Baixo</h3></div>
          <div className="card-content">
            {loadingSummary ? <p>Carregando...</p> : summaryError ? <p className="error-message">{summaryError}</p> : (
              summary && summary.lowStockItems && summary.lowStockItems.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                </div>
              ) : <p>Nenhum item com estoque baixo.</p>
            )}
          </div>
        </div>

        {/* Card: Lista Top 5 Solicitantes */}
        <div className="dashboard-card">
           <TopRequestersList />
        </div>


        {/* Card: Gráfico Top 5 Áreas Solicitantes */}
        <div className="dashboard-card full-width">
           <div className="card-content" style={{padding: 0}}>
              <TopSetoresChart />
           </div>
        </div>

        {/* Card: Itens com Maior Saída (Tabela) */}
        <div className="dashboard-card full-width">
           <div className="card-header">
            <h3 className="card-title">Top 5 Produtos com Maior Saída (Tabela)</h3>
            <div className="card-filters">
                <label htmlFor="startDateTop">De:</label>
                <input id="startDateTop" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                <label htmlFor="endDateTop">Até:</label>
                <input id="endDateTop" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                <button className="btn btn-primary" style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem'}} onClick={handleFilterSubmit} disabled={loadingTopItems}>
                  {loadingTopItems ? '...' : 'Aplicar'}
                </button>
            </div>
          </div>
          <div className="card-content">
             {loadingTopItems ? <p>Carregando...</p> : topItemsError ? <p className="error-message">{topItemsError}</p> :(
               topItems.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table-container" style={{boxShadow: 'none', borderRadius: 0}}>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Modelo</th>
                        <th style={{textAlign: 'right'}}>Total de Saídas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topItems.map(item => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.model || 'N/A'}</td>
                          <td style={{textAlign: 'right'}}>{item.total_exited}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
               ) : <p>Nenhuma saída registrada no período selecionado.</p>
            )}
          </div>
        </div>

      </div> {/* Fim do dashboard-grid */}
    </div>
  );
}

export default DashboardPage;