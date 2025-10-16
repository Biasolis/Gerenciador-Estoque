const express = require('express');
const router = express.Router();
const sectorController = require('../controllers/sectorController');
const authorize = require('../middlewares/authMiddleware');

// Rotas para Setores
// Qualquer usuário logado pode ver a lista de setores
router.get('/', authorize(['admin', 'user']), sectorController.getAll);

// Qualquer usuário logado pode criar um setor
router.post('/', authorize(['admin', 'user']), sectorController.create);

// Qualquer usuário logado pode editar um setor
router.put('/:id', authorize(['admin', 'user']), sectorController.update);

// APENAS administradores podem excluir um setor
router.delete('/:id', authorize(['admin']), sectorController.deleteById);

module.exports = router;