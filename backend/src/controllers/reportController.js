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
  }
};

module.exports = reportController;