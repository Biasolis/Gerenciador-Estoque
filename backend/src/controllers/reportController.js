const reportModel = require('../models/reportModel');

const reportController = {
  async getStockExitReport(req, res) {
     try {
      const filters = req.query;
      const reportData = await reportModel.generateStockExitReport(filters);
      res.status(200).json(reportData);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ message: 'Erro interno ao gerar o relatório.' });
    }
  },

  async getDashboardSummary(req, res) {
    try {
      const summaryData = await reportModel.getDashboardSummary();
      res.status(200).json(summaryData);
    } catch (error) {
      console.error('Erro ao buscar resumo do dashboard:', error);
      res.status(500).json({ message: 'Erro interno ao buscar dados do resumo.' });
    }
  },

  async getTopMovingItems(req, res) {
     try {
      const { startDate, endDate } = req.query;
      const topItems = await reportModel.getTopMovingItems({ startDate, endDate });
      res.status(200).json(topItems);
    } catch (error)
    {
      console.error('Erro ao buscar itens com maior saída:', error);
      res.status(500).json({ message: 'Erro interno ao buscar itens com maior saída.' });
    }
  },

  async getTopSectors(req, res) {
    try {
      const topSectorsData = await reportModel.getTopSectors(30);
      res.status(200).json(topSectorsData);
    } catch (error) {
      console.error('Erro ao buscar top setores solicitantes:', error);
      res.status(500).json({ message: 'Erro interno ao buscar dados do dashboard.' });
    }
  },

  // ==============================================================
  // !! FUNÇÃO EXISTENTE (DO SEU ARQUIVO) !!
  // ==============================================================
  async getTopRequesters(req, res) {
    try {
      const topRequestersData = await reportModel.getTopRequesters(30); // Usa 30 dias por padrão
      res.status(200).json(topRequestersData);
    } catch (error) {
      console.error('Erro ao buscar top solicitantes:', error);
      res.status(500).json({ message: 'Erro interno ao buscar dados do dashboard (top solicitantes).' });
    }
  },
  // ==============================================================

  // ==============================================================
  // !! NOVA FUNÇÃO ADICIONADA !!
  // ==============================================================
  async getLastRequests(req, res) {
    try {
      const lastRequests = await reportModel.getLastRequests();
      res.status(200).json(lastRequests);
    } catch (error) {
      console.error('Erro ao buscar últimas solicitações:', error);
      res.status(500).json({ message: 'Erro interno ao buscar últimas solicitações.' });
    }
  }
};

module.exports = reportController;