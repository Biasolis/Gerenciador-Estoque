const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authorize = require('../middlewares/authMiddleware');

// Todas as rotas aqui exigem que o usuário esteja logado (admin ou user)
router.use(authorize(['admin', 'user']));

// GET /api/profile/me - Busca dados do perfil logado
router.get('/me', profileController.getMyProfile);

// PUT /api/profile/me - Atualiza nome/apelido do perfil logado
router.put('/me', profileController.updateMyProfile);

// PUT /api/profile/change-password - Altera a senha do perfil logado
router.put('/change-password', profileController.changeMyPassword);

module.exports = router;