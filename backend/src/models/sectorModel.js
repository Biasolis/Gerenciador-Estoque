const db = require('./db');

const sectorModel = {
  // Cria um novo setor
  async create({ name, description }) {
    const query = `
      INSERT INTO sectors (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [name, description]);
    return rows[0];
  },

  // Busca todos os setores
  async findAll() {
    const { rows } = await db.query('SELECT * FROM sectors ORDER BY name ASC;');
    return rows;
  },

  // Busca um setor pelo ID
  async findById(id) {
    const { rows } = await db.query('SELECT * FROM sectors WHERE id = $1;', [id]);
    return rows[0];
  },

  // Atualiza um setor
  async update(id, { name, description }) {
    const query = `
      UPDATE sectors
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await db.query(query, [name, description, id]);
    return rows[0];
  },

  // Exclui um setor
  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM sectors WHERE id = $1;', [id]);
    return rowCount; // Retorna 1 se deletou, 0 se não encontrou
  }
};

module.exports = sectorModel;