const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const profileController = {
  // Buscar dados do usuário logado
  async getMyProfile(req, res) {
    try {
      const userId = req.user.id; // ID vem do token JWT (authMiddleware)
      const userProfile = await userModel.findById(userId);
      if (!userProfile) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      res.status(200).json(userProfile);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      res.status(500).json({ message: 'Erro interno ao buscar dados do perfil.' });
    }
  },

  // Atualizar dados básicos (nome, apelido)
  async updateMyProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, nickname } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'O nome é obrigatório.' });
      }

      const updatedUser = await userModel.updateProfile(userId, { name, nickname });
      if (!updatedUser) {
          return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      res.status(200).json(updatedUser); // Retorna os dados atualizados

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      res.status(500).json({ message: 'Erro interno ao atualizar dados do perfil.' });
    }
  },

  // Alterar a senha do usuário logado
  async changeMyPassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validações
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Senha atual, nova senha e confirmação são obrigatórias.' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'A nova senha e a confirmação não coincidem.' });
      }
      if (newPassword.length < 6) { // Exemplo de regra de complexidade mínima
         return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }

      // Buscar hash da senha atual no banco
      const storedHash = await userModel.findPasswordHashById(userId);
      if (!storedHash) {
         return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      // Comparar senha atual fornecida com o hash armazenado
      const isMatch = await bcrypt.compare(currentPassword, storedHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'A senha atual está incorreta.' });
      }

      // Se a senha atual estiver correta, atualiza para a nova senha
      await userModel.updatePassword(userId, newPassword);

      res.status(200).json({ message: 'Senha alterada com sucesso!' });

    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      res.status(500).json({ message: 'Erro interno ao alterar a senha.' });
    }
  }
};

module.exports = profileController;