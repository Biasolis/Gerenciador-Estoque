const db = require('./db');

const reportModel = {
  async generateStockExitReport(filters = {}) {
    let query = `
      SELECT
        sx.id, sx.quantity, sx.ticket_number, sx.delivery_date, sx.created_at,
        p.name AS product_name, person.name AS requester_name,
        sec.name AS sector_name, u.name AS user_name
      FROM stock_exits sx
      JOIN products p ON sx.product_id = p.id
      JOIN people person ON sx.requester_person_id = person.id
      JOIN users u ON sx.user_id = u.id
      LEFT JOIN sectors sec ON person.sector_id = sec.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;

    if (filters.ticket) {
      query += ` AND sx.ticket_number ILIKE $${paramIndex++}`;
      queryParams.push(`%${filters.ticket}%`);
    }
    if (filters.userId) {
      query += ` AND u.id = $${paramIndex++}`;
      queryParams.push(filters.userId);
    }
    if (filters.personId) {
      query += ` AND person.id = $${paramIndex++}`;
      queryParams.push(filters.personId);
    }
    if (filters.sectorId) {
      query += ` AND sec.id = $${paramIndex++}`;
      queryParams.push(filters.sectorId);
    }
    if (filters.startDate) {
      query += ` AND sx.created_at::date >= $${paramIndex++}::date`;
      queryParams.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ` AND sx.created_at::date <= $${paramIndex++}::date`;
      queryParams.push(filters.endDate);
    }

    query += ' ORDER BY sx.created_at DESC;';

    try {
      const { rows } = await db.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('ERRO NA EXECUÇÃO DA QUERY DE RELATÓRIO:', error);
      throw error;
    }
  },

  async getDashboardSummary() {
    const inventoryQuery = `
      SELECT
        p.id, p.name, p.model,
        (
          (SELECT COALESCE(SUM(se.quantity), 0) FROM stock_entries se WHERE se.product_id = p.id) -
          (SELECT COALESCE(SUM(sx.quantity), 0) FROM stock_exits sx WHERE sx.product_id = p.id)
        ) AS current_stock
      FROM products p;
    `;
    const { rows: inventory } = await db.query(inventoryQuery);
    const totalItems = inventory.reduce((sum, item) => sum + parseInt(item.current_stock, 10), 0);
    const lowStockItems = inventory.filter(item => item.current_stock <= 1);
    return { totalItems, lowStockItems };
  },

  async getTopMovingItems(filters = {}) {
    let query = `
      SELECT p.id, p.name, p.model, SUM(sx.quantity) as total_exited
      FROM stock_exits sx
      JOIN products p ON sx.product_id = p.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramIndex = 1;

    if (filters.startDate) {
        query += ` AND sx.created_at::date >= $${paramIndex++}::date`;
        queryParams.push(filters.startDate);
    }
    if (filters.endDate) {
        query += ` AND sx.created_at::date <= $${paramIndex++}::date`;
        queryParams.push(filters.endDate);
    }
    
    query += `
      GROUP BY p.id, p.name, p.model
      ORDER BY total_exited DESC
      LIMIT 5;
    `;
    const { rows } = await db.query(query, queryParams);
    return rows;
  }
};

module.exports = reportModel;