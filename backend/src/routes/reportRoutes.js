const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authorize = require('../middlewares/authMiddleware');

// Rotas do Dashboard (acessíveis para todos os usuários logados)
router.get('/dashboard-summary', authorize(['admin', 'user']), reportController.getDashboardSummary);
router.get('/top-moving-items', authorize(['admin', 'user']), reportController.getTopMovingItems);
router.get('/dashboard/top-setores', authorize(['admin', 'user']), reportController.getTopSectors);

// ==============================================================
// !! NOVA ROTA ADICIONADA !!
router.get('/dashboard/top-requesters', authorize(['admin', 'user']), reportController.getTopRequesters);
// ==============================================================

// Rota de Relatório de Saídas (apenas admin)
router.get('/stock-exits', authorize(['admin']), reportController.getStockExitReport);

module.exports = router;