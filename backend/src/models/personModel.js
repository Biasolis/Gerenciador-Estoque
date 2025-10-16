const db = require('./db');

const personModel = {
  // Cria uma nova pessoa
  async create({ name, email, extension_line, sector_id }) {
    const query = `
      INSERT INTO people (name, email, extension_line, sector_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [name, email, extension_line, sector_id || null];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Busca todas as pessoas, incluindo o nome do setor
  async findAll() {
    const query = `
      SELECT p.*, s.name as sector_name
      FROM people p
      LEFT JOIN sectors s ON p.sector_id = s.id
      ORDER BY p.name ASC;
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  // Atualiza os dados de uma pessoa
  async update(id, { name, email, extension_line, sector_id }) {
    const query = `
      UPDATE people
      SET name = $1, email = $2, extension_line = $3, sector_id = $4
      WHERE id = $5
      RETURNING *;
    `;
    const values = [name, email, extension_line, sector_id || null, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Exclui uma pessoa
  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM people WHERE id = $1;', [id]);
    return rowCount;
  }
};

module.exports = personModel;