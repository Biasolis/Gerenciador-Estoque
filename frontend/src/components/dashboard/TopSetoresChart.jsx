import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import api from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TopSetoresChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null); // Limpa erro anterior
                const response = await api.get('/reports/dashboard/top-setores');
                const data = response.data;

                // ============================================
                // !! CORREÇÃO APLICADA AQUI (LINHA ~75) !!
                // Verifica se 'data' é realmente um array antes de usar .map
                // ============================================
                if (Array.isArray(data)) {
                    if (data.length > 0) {
                        const labels = data.map(item => item.area_solicitante);
                        const solicitacoesData = data.map(item => item.quantidade_solicitacoes);
                        const produtosData = data.map(item => item.total_produtos_solicitados);

                        setChartData({
                            labels: labels,
                            datasets: [
                                {
                                    label: 'Nº de Solicitações',
                                    data: solicitacoesData,
                                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 1,
                                    yAxisID: 'ySolicitacoes',
                                },
                                {
                                    label: 'Total de Itens',
                                    data: produtosData,
                                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 1,
                                    yAxisID: 'yProdutos',
                                },
                            ],
                        });
                    } else {
                        // Se for um array vazio, mostra a mensagem apropriada
                        setChartData({ labels: ['Nenhum dado encontrado nos últimos 30 dias'], datasets: [] });
                    }
                } else {
                    // Se não for um array, lança um erro indicando formato inesperado
                    console.error("Formato de dados inesperado recebido da API para top setores:", data);
                    throw new Error('Formato de dados inesperado recebido da API.');
                }

            } catch (err) {
                console.error("Erro ao buscar dados para o gráfico:", err);
                const errorMsg = err.response?.data?.message || err.message || 'Não foi possível carregar o gráfico.';
                setError(errorMsg);
                setChartData({ labels: [], datasets: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Top 5 Áreas Solicitantes (Últimos 30 dias)',
                font: { size: 16 }
            },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: { title: { display: true, text: 'Áreas' } },
            ySolicitacoes: {
                type: 'linear', display: true, position: 'left',
                beginAtZero: true, title: { display: true, text: 'Nº de Solicitações' },
                grid: { drawOnChartArea: false }, ticks: { precision: 0 }
            },
            yProdutos: {
                type: 'linear', display: true, position: 'right',
                beginAtZero: true, title: { display: true, text: 'Total de Itens Solicitados' },
                ticks: { precision: 0 }
            },
        },
        interaction: { mode: 'index', intersect: false },
    };

    const containerStyle = {
        padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px',
        backgroundColor: '#ffffff', minHeight: '300px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#666'
    };
    const chartContainerStyle = { position: 'relative', height: '350px', width: '100%' };

    if (loading) {
        return <div style={containerStyle}>Carregando dados do gráfico...</div>;
    }

    if (error) {
        return <div style={{...containerStyle, color: 'red'}}>{error}</div>;
    }

    if (chartData.labels.length === 0 || chartData.labels[0]?.includes('Nenhum dado')) {
         return <div style={containerStyle}>Nenhum dado de saída encontrado nos últimos 30 dias para gerar o gráfico.</div>;
    }

    return (
         <div style={chartContainerStyle}>
            <Bar options={options} data={chartData} />
        </div>
    );
};

export default TopSetoresChart;