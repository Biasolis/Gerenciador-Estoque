import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './TopRequestersList.css'; // Criaremos este CSS a seguir

const TopRequestersList = () => {
  const [requesters, setRequesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/reports/dashboard/top-requesters'); // Chama o novo endpoint
        if (Array.isArray(response.data)) {
          setRequesters(response.data);
        } else {
          console.error("Resposta inesperada da API para top solicitantes:", response.data);
          setRequesters([]); // Define como vazio se não for array
        }
      } catch (err) {
        console.error("Erro ao buscar top solicitantes:", err);
        setError("Não foi possível carregar os solicitantes.");
        setRequesters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="top-requesters-card">
       {/* Usamos o mesmo estilo de header dos outros cards */}
      <div className="card-header">
        <h3 className="card-title">Top 5 Solicitantes (Últimos 30 dias)</h3>
      </div>
      <div className="card-content">
        {loading && <p>Carregando...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && requesters.length === 0 && (
          <p>Nenhuma solicitação encontrada nos últimos 30 dias.</p>
        )}
        {!loading && !error && requesters.length > 0 && (
          <ol className="requesters-list">
            {requesters.map((requester, index) => (
              <li key={index}>
                <span className="requester-name">{requester.nome_solicitante}</span>
                <span className="requester-count">{requester.total_solicitacoes}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default TopRequestersList;