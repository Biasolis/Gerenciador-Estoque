import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './PrintExitPage.css'; // Mantém o CSS existente
import '../styles/Table.css'; // Importa para usar table-container

function PrintExitPage() {
    const { id } = useParams();
    const [exitDetails, setExitDetails] = useState(null); // Agora inclui { ...header, items: [] }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchExitDetails = async () => {
            try {
                // A rota GET /stock/exits/:id agora retorna o cabeçalho e os itens
                const response = await api.get(`/stock/exits/${id}`);
                setExitDetails(response.data);
                // Dispara a impressão automaticamente
                setTimeout(() => window.print(), 500);
            } catch (err) {
                setError('Não foi possível carregar os dados para impressão.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchExitDetails();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // Usar formato completo com hora para o registro
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString('pt-BR', options);
    };
     const formatDateOnly = (dateString) => {
        if (!dateString) return 'N/A';
        // Formato apenas data
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando Ordem de Serviço...</p>;
    if (error) return <p className="error-message" style={{ textAlign: 'center', padding: '2rem' }}>{error}</p>;
    if (!exitDetails) return <p style={{ textAlign: 'center', padding: '2rem' }}>Nenhum dado encontrado.</p>;

    return (
        <div className="print-container">
            <header className="print-header">
                <h1>Ordem de Saída de Material</h1>
                <p><strong>Nº da Ordem:</strong> {String(exitDetails.id).padStart(6, '0')}</p>
            </header>

            {/* Dados Gerais da Solicitação */}
            <section className="print-section">
                <h2>Detalhes da Solicitação</h2>
                <p><strong>Solicitante:</strong> {exitDetails.requester_name || 'N/A'}</p>
                <p><strong>Setor:</strong> {exitDetails.sector_name || 'N/A'}</p>
                <p><strong>Data de Entrega Prevista:</strong> {formatDateOnly(exitDetails.delivery_date)}</p>
                <p><strong>Nº do Ticket:</strong> {exitDetails.ticket_number || 'N/A'}</p>
                <p><strong>Link do Ticket:</strong> {exitDetails.ticket_link ? <a href={exitDetails.ticket_link} target="_blank" rel="noopener noreferrer">{exitDetails.ticket_link}</a> : 'N/A'}</p>
            </section>

             {/* Motivo */}
             <section className="print-section">
                <h2>Motivo</h2>
                <p className="reason-box">{exitDetails.reason || 'Nenhum motivo especificado.'}</p>
            </section>

            {/* Tabela de Itens */}
            <section className="print-section">
                <h2>Itens Retirados</h2>
                {exitDetails.items && exitDetails.items.length > 0 ? (
                    <table className="table-container" style={{boxShadow: 'none', border: '1px solid #ccc'}}>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Modelo</th>
                                <th>Qtde</th>
                                <th>Nº Série</th>
                                <th>Patrimônio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exitDetails.items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.product_name}</td>
                                    <td>{item.product_model || 'N/A'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.serial_number || '-'}</td>
                                    <td>{item.asset_number || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Nenhum item encontrado nesta ordem de saída.</p>
                )}
            </section>

            {/* Rodapé */}
            <footer className="print-footer">
                <p><strong>Operador do Sistema:</strong> {exitDetails.user_name}</p>
                <p><strong>Data e Hora do Registro:</strong> {formatDate(exitDetails.created_at)}</p>
                <div className="signature-line">
                    <p>_________________________________________</p>
                    <p>Assinatura do Recebedor</p>
                </div>
            </footer>
        </div>
    );
}

export default PrintExitPage;