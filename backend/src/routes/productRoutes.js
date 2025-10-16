const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authorize = require('../middlewares/authMiddleware');

// Qualquer usuário logado pode ver a lista de produtos
router.get('/', authorize(['admin', 'user']), productController.getAll);

// Qualquer usuário logado pode criar um novo produto
router.post('/', authorize(['admin', 'user']), productController.create);

// Qualquer usuário logado pode editar um produto
router.put('/:id', authorize(['admin', 'user']), productController.update);

// Apenas administradores podem excluir um produto
router.delete('/:id', authorize(['admin']), productController.deleteById);

module.exports = router;