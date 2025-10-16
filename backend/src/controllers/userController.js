const userModel = require('../models/userModel');

const userController = {
  // Listar todos os usuários
  async getAll(req, res) {
    try {
      const users = await userModel.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
  },

  // Criar um novo usuário (Admin)
  async create(req, res) {
    try {
      const { name, email, password, role, is_active } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Nome, email, senha e tipo de usuário são obrigatórios.' });
      }

      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Este email já está em uso.' });
      }

      const newUser = await userModel.create({ name, email, password, role, is_active });
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar usuário.' });
    }
  },

  // Atualizar um usuário (Admin)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, is_active, password } = req.body;

      // REGRA DE SEGURANÇA: Impede que um admin desative a si mesmo ou mude seu próprio tipo para 'user'
      const adminUserId = req.user.id;
      if (parseInt(id, 10) === adminUserId && (role !== 'admin' || !is_active)) {
        return res.status(403).json({ message: 'Um administrador não pode remover seu próprio acesso de admin ou desativar a própria conta.' });
      }
      
      const updatedUser = await userModel.update(id, { name, email, role, is_active, password });
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
  },

  // Excluir um usuário (Admin)
  async deleteById(req, res) {
    try {
      const { id } = req.params;
      
      // REGRA DE SEGURANÇA: Impede que um admin se autoexclua
      if (parseInt(id, 10) === req.user.id) {
        return res.status(403).json({ message: 'Você não pode excluir sua própria conta.' });
      }
      
      const result = await userModel.remove(id);
      if (result === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      if (error.code === '23503') {
        return res.status(409).json({ message: 'Este usuário não pode ser excluído pois possui registros de movimentação de estoque.' });
      }
      res.status(500).json({ message: 'Erro ao excluir usuário.' });
    }
  }
};

module.exports = userController;