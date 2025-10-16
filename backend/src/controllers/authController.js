const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // Função para registrar um novo usuário
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validação simples
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
      }

      // Verifica se o email já está em uso
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Este email já está cadastrado.' });
      }

      // Cria o usuário (a senha é hasheada dentro do model)
      const newUser = await userModel.create({ name, email, password, role });

      res.status(201).json({ message: 'Usuário criado com sucesso!', user: newUser });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  // Função para realizar o login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
      }

      // Busca o usuário pelo email
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas.' }); // Email não encontrado
      }
      
      // Verifica se o usuário está ativo
      if (!user.is_active) {
        return res.status(403).json({ message: 'Este usuário está desativado.' });
      }

      // Compara a senha enviada com a senha hasheada no banco
      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Credenciais inválidas.' }); // Senha incorreta
      }

      // Se as credenciais estiverem corretas, gera um token JWT
      const tokenPayload = {
        id: user.id,
        role: user.role
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: '8h' } // Token expira em 8 horas
      );
      
      // Remove a senha do objeto de usuário antes de enviar a resposta
      delete user.password_hash;

      res.status(200).json({ user, token });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
};

module.exports = authController;