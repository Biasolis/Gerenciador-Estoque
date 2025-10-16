import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './PrintExitPage.css';

function PrintExitPage() {
    const { id } = useParams();
    const [exitDetails, setExitDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchExitDetails = async () => {
            try {
                const response = await api.get(`/stock/exits/${id}`);
                setExitDetails(response.data);
                // Dispara a impressão automaticamente após carregar os dados
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
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString('pt-BR', options);
    };

    if (loading) return <p>Carregando Ordem de Serviço...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!exitDetails) return <p>Nenhum dado encontrado.</p>;

    return (
        <div className="print-container">
            <header className="print-header">
                <h1>Saída de Estoque</h1>
                <p><strong>Nº da Ordem:</strong> {String(exitDetails.id).padStart(6, '0')}</p>
            </header>

            <section className="print-section">
                <h2>Detalhes do Produto</h2>
                <p><strong>Produto:</strong> {exitDetails.product_name}</p>
                <p><strong>Modelo:</strong> {exitDetails.product_model || 'N/A'}</p>
                <p><strong>Quantidade Retirada:</strong> {exitDetails.quantity}</p>
            </section>

            <section className="print-section">
                <h2>Detalhes da Solicitação</h2>
                <p><strong>Solicitante:</strong> {exitDetails.requester_name}</p>
                <p><strong>Setor:</strong> {exitDetails.sector_name || 'N/A'}</p>
                <p><strong>Data de Entrega:</strong> {formatDate(exitDetails.delivery_date)}</p>
                <p><strong>Nº do Ticket:</strong> {exitDetails.ticket_number || 'N/A'}</p>
                <p><strong>Link do Ticket:</strong> {exitDetails.ticket_link ? <a href={exitDetails.ticket_link} target="_blank" rel="noopener noreferrer">{exitDetails.ticket_link}</a> : 'N/A'}</p>
            </section>
            
            <section className="print-section">
                <h2>Motivo</h2>
                <p className="reason-box">{exitDetails.reason || 'Nenhum motivo especificado.'}</p>
            </section>

            <footer className="print-footer">
                <p><strong>Operador do Sistema:</strong> {exitDetails.user_name}</p>
                <p><strong>Data do Registro:</strong> {formatDate(exitDetails.created_at)}</p>
                <div className="signature-line">
                    <p>_________________________________________</p>
                    <p>Assinatura do Recebedor</p>
                </div>
            </footer>
        </div>
    );
}

export default PrintExitPage;