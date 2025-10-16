import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import '../styles/Table.css';
import './ReportsPage.css';

const initialFilters = {
  ticket: '',
  userId: '',
  personId: '',
  sectorId: '',
  startDate: '',
  endDate: '',
};

function ReportsPage() {
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({ users: [], people: [], sectors: [] });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { showAlert } = useNotification();

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [usersRes, peopleRes, sectorsRes] = await Promise.all([
          api.get('/users'),
          api.get('/people'),
          api.get('/sectors'),
        ]);
        setFilterOptions({
          users: usersRes.data,
          people: peopleRes.data,
          sectors: sectorsRes.data,
        });
      } catch (error) {
        console.error("Erro ao carregar opções de filtro:", error);
        showAlert('Não foi possível carregar os filtros.', 'Erro');
      } finally {
        setInitialLoad(false);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      
      const response = await api.get(`/reports/stock-exits?${queryParams.toString()}`);
      setReportData(response.data);
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
      showAlert(error.response?.data?.message || 'Não foi possível buscar o relatório.', 'Erro na Busca');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setReportData([]);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('pt-BR', options);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Relatório de Saídas de Estoque</h1>
      </div>

      {initialLoad ? <p>Carregando filtros...</p> : (
        <div className="filters-panel">
          <div className="form-group">
            <label>Nº do Ticket</label>
            <input type="text" name="ticket" value={filters.ticket} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>Usuário (Operador)</label>
            <select name="userId" value={filters.userId} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {filterOptions.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Solicitante</label>
            <select name="personId" value={filters.personId} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {filterOptions.people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Setor</label>
            <select name="sectorId" value={filters.sectorId} onChange={handleFilterChange}>
              {/* --- CORREÇÃO APLICADA AQUI --- */}
              <option value="">Todos</option>
              {filterOptions.sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Data Início</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label>Data Fim</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={handleClearFilters}>Limpar Filtros</button>
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      )}

      <div className="report-results">
        <table className="table-container">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtde.</th>
              <th>Solicitante</th>
              <th>Setor</th>
              <th>Nº Ticket</th>
              <th>Operador</th>
              <th>Data da Saída</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map(item => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>{item.requester_name}</td>
                <td>{item.sector_name}</td>
                <td>{item.ticket_number}</td>
                <td>{item.user_name}</td>
                <td>{formatDate(item.created_at)}</td>
              </tr>
            ))}
            {!loading && reportData.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>Nenhum registro encontrado para os filtros selecionados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;