const db = require('./db');

const stockModel = {
  /**
   * Calcula o status atual do inventário para todos os produtos.
   */
  async getInventoryStatus() {
    const query = `
      SELECT
        p.id,
        p.name,
        p.model,
        p.description,
        (
          (SELECT COALESCE(SUM(se.quantity), 0) FROM stock_entries se WHERE se.product_id = p.id) -
          (SELECT COALESCE(SUM(sx.quantity), 0) FROM stock_exits sx WHERE sx.product_id = p.id)
        ) AS current_stock
      FROM
        products p
      ORDER BY
        p.name ASC;
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  /**
   * Calcula o estoque atual para um único produto.
   * @param {number} productId - O ID do produto.
   * @returns {Promise<number>} - A quantidade atual em estoque.
   */
  async getCurrentStockForProduct(productId) {
    const query = `
      SELECT
        (
          (SELECT COALESCE(SUM(se.quantity), 0) FROM stock_entries se WHERE se.product_id = $1) -
          (SELECT COALESCE(SUM(sx.quantity), 0) FROM stock_exits sx WHERE sx.product_id = $1)
        ) AS current_stock;
    `;
    const { rows } = await db.query(query, [productId]);
    return parseInt(rows[0].current_stock, 10);
  }
};

module.exports = stockModel;