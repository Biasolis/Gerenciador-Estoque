const db = require('./db');

const stockExitModel = {
  // Cria um novo registro de saída de estoque (Ordem de Serviço)
  async create({ product_id, quantity, ticket_number, ticket_link, reason, delivery_date, requester_person_id, user_id }) {
    const query = `
      INSERT INTO stock_exits 
        (product_id, quantity, ticket_number, ticket_link, reason, delivery_date, requester_person_id, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [product_id, quantity, ticket_number, ticket_link, reason, delivery_date, requester_person_id, user_id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Busca todos os registros de saída com detalhes
  async findAll() {
    const query = `
      SELECT
        sx.id, sx.quantity, sx.ticket_number, sx.ticket_link, sx.reason, sx.delivery_date,
        p.name AS product_name,
        person.name AS requester_name,
        sec.name AS sector_name,
        u.name AS user_name
      FROM stock_exits sx
      JOIN products p ON sx.product_id = p.id
      JOIN people person ON sx.requester_person_id = person.id
      JOIN users u ON sx.user_id = u.id
      LEFT JOIN sectors sec ON person.sector_id = sec.id
      ORDER BY sx.created_at DESC;
    `;
    const { rows } = await db.query(query);
    return rows;
  },
  
  // Busca um único registro de saída pelo ID (para impressão)
  async findById(id) {
    const query = `
      SELECT
        sx.*,
        p.name AS product_name, p.model AS product_model,
        person.name AS requester_name,
        sec.name AS sector_name,
        u.name AS user_name
      FROM stock_exits sx
      JOIN products p ON sx.product_id = p.id
      JOIN people person ON sx.requester_person_id = person.id
      JOIN users u ON sx.user_id = u.id
      LEFT JOIN sectors sec ON person.sector_id = sec.id
      WHERE sx.id = $1;
    `;
     const { rows } = await db.query(query, [id]);
    return rows[0];
  }
};

module.exports = stockExitModel;