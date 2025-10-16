const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authorize = require('../middlewares/authMiddleware');

// Protege todas as rotas deste arquivo, exigindo a role 'admin'
router.use(authorize(['admin']));

router.get('/', userController.getAll);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.deleteById);

module.exports = router;