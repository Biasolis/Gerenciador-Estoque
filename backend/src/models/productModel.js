const db = require('./db');

const productModel = {
  // Cria um novo produto
  async create({ name, description, model }) {
    const query = `
      INSERT INTO products (name, description, model)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, description, model];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Busca todos os produtos
  async findAll() {
    const query = `SELECT * FROM products ORDER BY name ASC;`;
    const { rows } = await db.query(query);
    return rows;
  },

  // Atualiza um produto
  async update(id, { name, description, model }) {
    const query = `
      UPDATE products
      SET name = $1, description = $2, model = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [name, description, model, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Exclui um produto
  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM products WHERE id = $1;', [id]);
    return rowCount;
  }
};

module.exports = productModel;