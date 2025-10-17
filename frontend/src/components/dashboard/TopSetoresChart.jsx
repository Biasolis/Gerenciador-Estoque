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

// Precisamos registrar os componentes do Chart.js que vamos usar
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/**
 * =========================================================================
 * !! IMPORTANTE !!
 * * Substitua esta função 'apiGet' pela sua chamada de API real.
 * Pode ser que você já tenha um serviço de API centralizado (ex: usando axios).
 * O ponto crucial é enviar o Token JWT na requisição.
 * =========================================================================
 */
const apiGet = async (url) => {
    // 1. Pega o token do localStorage (ou de onde você o armazena)
    const token = localStorage.getItem('token'); 
    if (!token) {
        throw new Error('Token de autenticação não encontrado');
    }

    // 2. Monta a URL completa
    // Lembre-se que no Vite, /api/ é tratado pelo proxy no modo de desenvolvimento,
    // mas em produção, o Nginx já cuida disso. Então /api/... está correto.
    const fullUrl = `${url}`; // Ex: /api/dashboard/top-setores

    // 3. Faz a chamada fetch (ou axios)
    const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar dados da API');
    }

    return response.json();
};
// =========================================================================


const TopSetoresChart = () => {
    // Estado para guardar os dados formatados para o gráfico
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
    });

    // Estado de carregamento e erro
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Chamada para o novo endpoint que criamos no backend
                const data = await apiGet('/api/dashboard/top-setores');

                if (data && data.length > 0) {
                    // Processa os dados recebidos da API
                    const labels = data.map(item => item.area_solicitante);
                    const solicitacoesData = data.map(item => item.quantidade_solicitacoes);
                    const produtosData = data.map(item => item.total_produtos_solicitados);

                    // Formata para o padrão do Chart.js
                    setChartData({
                        labels: labels,
                        datasets: [
                            {
                                label: 'Nº de Solicitações',
                                data: solicitacoesData,
                                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Azul
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1,
                            },
                            {
                                label: 'Total de Itens',
                                data: produtosData,
                                backgroundColor: 'rgba(255, 99, 132, 0.6)', // Vermelho
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1,
                            },
                        ],
                    });
                } else {
                    // Caso não venha dados (ex: 30 dias sem movimento)
                     setChartData({ labels: ['Nenhum dado encontrado nos últimos 30 dias'], datasets: [] });
                }

                setError(null);
            } catch (err) {
                console.error("Erro ao buscar dados para o gráfico:", err);
                setError(err.message || 'Não foi possível carregar o gráfico.');
                setChartData({ labels: [], datasets: [] }); // Limpa em caso de erro
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // O array vazio garante que isso rode apenas uma vez (ao montar)

    // Configurações visuais do gráfico
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Top 5 Áreas Solicitantes (Últimos 30 dias)',
                font: {
                    size: 18
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Quantidade'
                }
            },
            x: {
                 title: {
                    display: true,
                    text: 'Áreas'
                }
            }
        }
    };

    // Estilos para os contêineres de loading e erro
    const containerStyle = {
        padding: '20px', 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        backgroundColor: '#ffffff',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
    };

    // Renderização condicional
    if (loading) {
        return <div style={containerStyle}>Carregando dados do gráfico...</div>;
    }

    if (error) {
        return <div style={{...containerStyle, color: 'red'}}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
            <Bar options={options} data={chartData} />
        </div>
    );
};

export default TopSetoresChart;