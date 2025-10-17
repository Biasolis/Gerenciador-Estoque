const db = require('./db');

const reportModel = {
  async generateStockExitReport(filters = {}) {
    // ... (Esta função parece OK, pois busca dados do cabeçalho principalmente) ...
    // Vamos garantir que ela não usa as colunas removidas
    let query = `
      SELECT
        sx.id, sx.ticket_number, sx.delivery_date, sx.created_at, sx.reason, sx.ticket_link, -- Colunas de stock_exits
        person.name AS requester_name,
        sec.name AS sector_name,
        u.name AS user_name,
        -- Adicionamos uma subquery para contar os itens, se necessário
        (SELECT COUNT(*) FROM stock_exit_items sei WHERE sei.exit_id = sx.id) as item_count
      FROM stock_exits sx
      LEFT JOIN people person ON sx.requester_person_id = person.id
      LEFT JOIN users u ON sx.user_id = u.id
      LEFT JOIN sectors sec ON person.sector_id = sec.id
      WHERE 1=1
    `;
    const queryParams = [];
    let paramIndex = 1;

    // Filtros permanecem os mesmos
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
      // Nota: Esta query agora não retorna product_name ou quantity diretamente.
      // Se o relatório precisar desses detalhes, teríamos que fazer JOIN com stock_exit_items
      // ou fazer queries separadas. Por ora, removemos as colunas problemáticas.
      return rows;
    } catch (error) {
      console.error('ERRO NA EXECUÇÃO DA QUERY DE RELATÓRIO:', error);
      throw error;
    }
  },

  async getDashboardSummary() {
    // ============================================
    // !! CORREÇÃO APLICADA AQUI !!
    // Calcula o estoque usando stock_exit_items
    // ============================================
    const inventoryQuery = `
      SELECT
        p.id, p.name, p.model,
        (
          COALESCE((SELECT SUM(se.quantity) FROM stock_entries se WHERE se.product_id = p.id), 0) -
          COALESCE((SELECT SUM(sei.quantity) FROM stock_exit_items sei WHERE sei.product_id = p.id), 0) -- Usa stock_exit_items
        ) AS current_stock
      FROM products p;
    `;
    try {
        const { rows: inventory } = await db.query(inventoryQuery);
        const totalItems = inventory.reduce((sum, item) => sum + parseInt(item.current_stock, 10), 0);
        const lowStockItems = inventory.filter(item => item.current_stock <= 1);
        return { totalItems, lowStockItems };
    } catch (error) {
        console.error('Erro ao buscar resumo do dashboard (getDashboardSummary):', error);
         if (error.stack) {
             console.error(error.stack);
         }
        throw error;
    }
  },

  async getTopMovingItems(filters = {}) {
    // ============================================
    // !! CORREÇÃO APLICADA AQUI !!
    // Faz JOIN com stock_exit_items e soma a quantidade dali
    // ============================================
    let query = `
      SELECT
        p.id, p.name, p.model,
        SUM(sei.quantity)::INTEGER as total_exited -- Soma de stock_exit_items
      FROM stock_exit_items sei             -- FROM stock_exit_items
      JOIN stock_exits sx ON sei.exit_id = sx.id -- JOIN com stock_exits para filtros de data
      JOIN products p ON sei.product_id = p.id   -- JOIN com products
      WHERE 1=1
    `;
    const queryParams = [];
    let paramIndex = 1;

    // Filtros aplicados à data da ORDEM DE SAÍDA (sx.created_at)
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
    try {
        const { rows } = await db.query(query, queryParams);
        return rows;
    } catch(error){
        console.error('Erro ao buscar top moving items:', error);
        if (error.stack) {
            console.error(error.stack);
        }
        throw error;
    }
  },

  async getTopSectors(lastDays = 30) {
    // ============================================
    // !! CORREÇÃO APLICADA AQUI !!
    // Faz JOIN com stock_exit_items e soma a quantidade dali
    // ============================================
    const query = `
      SELECT
          s.name AS "area_solicitante",
          COUNT(DISTINCT sx.id)::INTEGER AS "quantidade_solicitacoes", -- Conta ordens distintas
          COALESCE(SUM(sei.quantity), 0)::INTEGER AS "total_produtos_solicitados" -- Soma itens
      FROM
          stock_exits AS sx
      JOIN
          people AS person ON sx.requester_person_id = person.id
      JOIN
          sectors AS s ON person.sector_id = s.id
      LEFT JOIN -- LEFT JOIN para incluir setores que solicitaram mas talvez não tenham itens (improvável)
          stock_exit_items AS sei ON sei.exit_id = sx.id
      WHERE
          sx.created_at >= NOW() - (INTERVAL '1 day' * $1)
          AND person.sector_id IS NOT NULL
      GROUP BY
          s.name
      ORDER BY
          "total_produtos_solicitados" DESC, "quantidade_solicitacoes" DESC
      LIMIT 5;
    `;
    try {
      const { rows } = await db.query(query, [lastDays]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar top setores solicitantes (getTopSectors):', error);
      if (error.stack) {
        console.error(error.stack);
      }
      throw error;
    }
  },

  async getTopRequesters(lastDays = 30) {
    // Esta função já estava correta, pois contava apenas sx.id
    const query = `
      SELECT
          p.name AS "nome_solicitante",
          COUNT(sx.id)::INTEGER AS "total_solicitacoes" -- Conta ordens de saída
      FROM
          stock_exits AS sx
      JOIN
          people AS p ON sx.requester_person_id = p.id
      WHERE
          sx.created_at >= NOW() - (INTERVAL '1 day' * $1)
          AND sx.requester_person_id IS NOT NULL
      GROUP BY
          p.id, p.name
      ORDER BY
          "total_solicitacoes" DESC
      LIMIT 5;
    `;
    try {
      const { rows } = await db.query(query, [lastDays]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar top solicitantes:', error);
      if (error.stack) {
        console.error(error.stack);
      }
      throw error;
    }
  }
};

module.exports = reportModel;