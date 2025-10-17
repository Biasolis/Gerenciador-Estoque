const db = require('./db');
const bcrypt = require('bcryptjs');

const userModel = {
  // Busca um usuário pelo email (incluindo hash da senha para login)
  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  // Busca um usuário pelo ID (sem a senha) - Usado para exibir perfil e na gestão de usuários
  async findById(id) {
    // Retorna nome E nickname
    const { rows } = await db.query('SELECT id, name, nickname, email, role, is_active FROM users WHERE id = $1', [id]);
    return rows[0];
  },

  // Busca todos os usuários (sem as senhas)
  async findAll() {
    const { rows } = await db.query('SELECT id, name, nickname, email, role, is_active FROM users ORDER BY name ASC');
    return rows;
  },

  // Cria um novo usuário
  async create(userData) {
    // Adiciona nickname ao desestruturar
    const { name, nickname, email, password, role = 'user', is_active = true } = userData;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (name, nickname, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, nickname, email, role, is_active, created_at
    `;
    // Adiciona nickname aos values
    const values = [name, nickname, email, passwordHash, role, is_active];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Atualiza um usuário (usado por Admin na gestão)
  async update(id, userData) {
    // Adiciona nickname
    const { name, nickname, email, role, is_active, password } = userData;
    let query;
    let values;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      query = `
        UPDATE users SET name = $1, nickname = $2, email = $3, role = $4, is_active = $5, password_hash = $6, updated_at = NOW()
        WHERE id = $7
        RETURNING id, name, nickname, email, role, is_active;
      `;
      values = [name, nickname, email, role, is_active, passwordHash, id];
    } else {
      query = `
        UPDATE users SET name = $1, nickname = $2, email = $3, role = $4, is_active = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING id, name, nickname, email, role, is_active;
      `;
      values = [name, nickname, email, role, is_active, id];
    }

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Exclui um usuário
  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount;
  },

  // ============================================
  // !! NOVAS FUNÇÕES PARA PERFIL !!
  // ============================================

  // Atualiza apenas dados básicos do perfil (nome, apelido)
  async updateProfile(id, { name, nickname }) {
    const query = `
      UPDATE users SET name = $1, nickname = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, nickname, email, role, is_active; -- Retorna dados atualizados
    `;
    const values = [name, nickname, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Busca o hash da senha de um usuário específico (necessário para comparar senha atual)
  async findPasswordHashById(id) {
    const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [id]);
    return rows[0]?.password_hash; // Retorna apenas o hash ou undefined
  },

  // Atualiza apenas a senha do usuário
  async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    const query = `
      UPDATE users SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id; -- Retorna apenas o ID para confirmação
    `;
    const { rows } = await db.query(query, [passwordHash, id]);
    return rows[0];
  }
  // ============================================
};

module.exports = userModel;