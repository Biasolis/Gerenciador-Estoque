const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para login de usuário
// POST /api/auth/login
router.post('/login', authController.login);

// Rota para registrar um novo usuário
// POST /api/auth/register
// Futuramente, esta rota será protegida para ser acessível apenas por admins.
// Por enquanto, vamos deixá-la aberta para criar o primeiro admin.
router.post('/register', authController.register);

module.exports = router;