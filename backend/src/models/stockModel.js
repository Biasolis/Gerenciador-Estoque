const db = require('./db');

const stockModel = {
  /**
   * Calcula o status atual do inventário para todos os produtos.
   */
  async getInventoryStatus() {
    // ============================================
    // !! CORREÇÃO APLICADA AQUI !!
    // A subquery para saídas agora usa SUM(sei.quantity) da tabela stock_exit_items
    // ============================================
    const query = `
      SELECT
        p.id,
        p.name,
        p.model,
        p.description,
        (
          COALESCE((SELECT SUM(se.quantity) FROM stock_entries se WHERE se.product_id = p.id), 0) -
          COALESCE((SELECT SUM(sei.quantity) FROM stock_exit_items sei WHERE sei.product_id = p.id), 0) -- Corrigido aqui
        ) AS current_stock
      FROM
        products p
      ORDER BY
        p.name ASC;
    `;
    try {
        const { rows } = await db.query(query);
        return rows;
    } catch(error) {
        console.error("Erro ao buscar status do inventário (getInventoryStatus):", error);
        if(error.stack) console.error(error.stack);
        throw error;
    }
  },

  /**
   * Calcula o estoque atual para um único produto.
   * @param {number} productId - O ID do produto.
   * @returns {Promise<number>} - A quantidade atual em estoque.
   */
  async getCurrentStockForProduct(productId) {
     // ============================================
    // !! CORREÇÃO APLICADA AQUI TAMBÉM !!
    // A subquery para saídas agora usa SUM(sei.quantity) da tabela stock_exit_items
    // ============================================
    const query = `
      SELECT
        (
          COALESCE((SELECT SUM(se.quantity) FROM stock_entries se WHERE se.product_id = $1), 0) -
          COALESCE((SELECT SUM(sei.quantity) FROM stock_exit_items sei WHERE sei.product_id = $1), 0) -- Corrigido aqui
        ) AS current_stock;
    `;
    try {
        const { rows } = await db.query(query, [productId]);
        // Garante que retornamos 0 se não houver resultado (produto nunca movimentado)
        return parseInt(rows[0]?.current_stock || 0, 10);
    } catch(error) {
         console.error(`Erro ao buscar estoque atual para produto ${productId}:`, error);
         if(error.stack) console.error(error.stack);
         throw error;
    }
  }
};

module.exports = stockModel;