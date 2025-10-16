const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');
const authorize = require('../middlewares/authMiddleware');

// Qualquer usuário logado pode ver a lista
router.get('/', authorize(['admin', 'user']), personController.getAll);

// Qualquer usuário logado pode criar
router.post('/', authorize(['admin', 'user']), personController.create);

// Qualquer usuário logado pode editar
router.put('/:id', authorize(['admin', 'user']), personController.update);

// Apenas administradores podem excluir
router.delete('/:id', authorize(['admin']), personController.deleteById);

module.exports = router;