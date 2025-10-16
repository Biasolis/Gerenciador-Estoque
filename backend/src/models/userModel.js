const db = require('./db');
const bcrypt = require('bcryptjs');

const userModel = {
  // Busca um usuário pelo email
  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  // Busca um usuário pelo ID (sem a senha)
  async findById(id) {
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
    const { name, email, password, role = 'user', is_active = true } = userData;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, is_active, created_at
    `;
    const values = [name, email, passwordHash, role, is_active];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Atualiza um usuário
  async update(id, userData) {
    const { name, email, role, is_active, password } = userData;

    let query;
    let values;

    // Se uma nova senha for fornecida, faz o hash e atualiza
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      query = `
        UPDATE users SET name = $1, email = $2, role = $3, is_active = $4, password_hash = $5
        WHERE id = $6
        RETURNING id, name, email, role, is_active;
      `;
      values = [name, email, role, is_active, passwordHash, id];
    } else {
      // Se não, atualiza apenas os outros campos
      query = `
        UPDATE users SET name = $1, email = $2, role = $3, is_active = $4
        WHERE id = $5
        RETURNING id, name, email, role, is_active;
      `;
      values = [name, email, role, is_active, id];
    }
    
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Exclui um usuário
  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount;
  }
};

module.exports = userModel;