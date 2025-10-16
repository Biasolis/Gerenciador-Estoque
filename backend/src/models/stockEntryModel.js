const db = require('./db');

const stockEntryModel = {
  // Cria um novo registro de entrada de estoque
  async create({ product_id, quantity, unit_value, entry_date, user_id }) {
    const query = `
      INSERT INTO stock_entries (product_id, quantity, unit_value, entry_date, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    // Se a data não for fornecida, o banco usará o valor padrão (CURRENT_TIMESTAMP)
    const values = [product_id, quantity, unit_value, entry_date || new Date(), user_id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Busca todos os registros de entrada com detalhes do produto e usuário
  async findAll() {
    const query = `
      SELECT
        se.id,
        se.quantity,
        se.unit_value,
        se.entry_date,
        p.name AS product_name,
        p.model AS product_model,
        u.name AS user_name
      FROM stock_entries se
      JOIN products p ON se.product_id = p.id
      JOIN users u ON se.user_id = u.id
      ORDER BY se.entry_date DESC;
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  // (Opcional, mas bom ter) Exclui um registro de entrada
  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM stock_entries WHERE id = $1;', [id]);
    return rowCount;
  }
};

module.exports = stockEntryModel;