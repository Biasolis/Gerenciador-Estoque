const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const authorize = require('../middlewares/authMiddleware');

// Rota para buscar o status do inventário
router.get('/inventory', authorize(['admin', 'user']), stockController.getInventory);

// Rotas de Entrada de Estoque
router.post('/entries', authorize(['admin', 'user']), stockController.createEntry);
router.get('/entries', authorize(['admin', 'user']), stockController.getAllEntries);
router.delete('/entries/:id', authorize(['admin']), stockController.deleteEntry);

// Rotas de Saída de Estoque
router.post('/exits', authorize(['admin', 'user']), stockController.createExit);
router.get('/exits', authorize(['admin', 'user']), stockController.getAllExits);
router.get('/exits/:id', authorize(['admin', 'user']), stockController.getExitById);

// Rota para Ajuste de Estoque (apenas admin)
router.post('/adjust', authorize(['admin']), stockController.adjustStock);

module.exports = router;