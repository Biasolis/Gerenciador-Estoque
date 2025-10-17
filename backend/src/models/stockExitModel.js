const db = require('./db');

const stockExitModel = {
  // Cria um novo registro de saída (Ordem) e seus itens
  async create(exitData, items) {
    const client = await db.pool.connect(); // Obtém um cliente do pool para transação

    try {
      await client.query('BEGIN'); // Inicia a transação

      // Insere o cabeçalho da ordem de saída
      const exitQuery = `
        INSERT INTO stock_exits
          (ticket_number, ticket_link, reason, delivery_date, requester_person_id, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const exitValues = [
        exitData.ticket_number, exitData.ticket_link, exitData.reason,
        exitData.delivery_date, exitData.requester_person_id, exitData.user_id
      ];
      const { rows: exitRows } = await client.query(exitQuery, exitValues);
      const newExit = exitRows[0];

      // Insere cada item da ordem de saída
      const itemQuery = `
        INSERT INTO stock_exit_items
          (exit_id, product_id, quantity, serial_number, asset_number)
        VALUES ($1, $2, $3, $4, $5);
      `;
      // Prepara todas as inserções dos itens
      const itemInsertPromises = items.map(item => {
        const itemValues = [
          newExit.id, item.product_id, item.quantity,
          item.serial_number || null, // Garante NULL se não fornecido
          item.asset_number || null   // Garante NULL se não fornecido
        ];
        return client.query(itemQuery, itemValues);
      });
      // Executa todas as inserções em paralelo dentro da transação
      await Promise.all(itemInsertPromises);

      await client.query('COMMIT'); // Confirma a transação
      return newExit; // Retorna o cabeçalho da ordem criada

    } catch (error) {
      await client.query('ROLLBACK'); // Desfaz a transação em caso de erro
      console.error('Erro na transação de criação de saída:', error);
      throw error; // Re-lança o erro para o controller
    } finally {
      client.release(); // Libera o cliente de volta para o pool
    }
  },

  // Busca todos os registros de saída com detalhes (simplificado para a lista principal)
  // Poderíamos adicionar detalhes dos itens aqui se necessário, mas pode poluir a lista.
  async findAll() {
    const query = `
      SELECT
        sx.id, sx.ticket_number, sx.ticket_link, sx.reason, sx.delivery_date, sx.created_at,
        person.name AS requester_name,
        sec.name AS sector_name,
        u.name AS user_name,
        -- Contagem de itens distintos na ordem
        (SELECT COUNT(DISTINCT sei.product_id) FROM stock_exit_items sei WHERE sei.exit_id = sx.id) AS distinct_items_count,
         -- Soma da quantidade total de itens na ordem
        (SELECT SUM(sei.quantity) FROM stock_exit_items sei WHERE sei.exit_id = sx.id) AS total_quantity
      FROM stock_exits sx
      LEFT JOIN people person ON sx.requester_person_id = person.id -- Usar LEFT JOIN se solicitante for opcional
      LEFT JOIN users u ON sx.user_id = u.id
      LEFT JOIN sectors sec ON person.sector_id = sec.id
      ORDER BY sx.created_at DESC;
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  // Busca um único registro de saída pelo ID, incluindo todos os seus itens
  async findById(id) {
    const client = await db.pool.connect();
    try {
      // Busca o cabeçalho
      const exitQuery = `
        SELECT
          sx.*,
          person.name AS requester_name,
          sec.name AS sector_name,
          u.name AS user_name
        FROM stock_exits sx
        LEFT JOIN people person ON sx.requester_person_id = person.id
        LEFT JOIN users u ON sx.user_id = u.id
        LEFT JOIN sectors sec ON person.sector_id = sec.id
        WHERE sx.id = $1;
      `;
      const { rows: exitRows } = await client.query(exitQuery, [id]);
      const exitDetails = exitRows[0];

      if (!exitDetails) {
        return null; // Ordem não encontrada
      }

      // Busca os itens associados
      const itemsQuery = `
        SELECT
          sei.*,
          p.name AS product_name,
          p.model AS product_model
        FROM stock_exit_items sei
        JOIN products p ON sei.product_id = p.id
        WHERE sei.exit_id = $1
        ORDER BY p.name ASC; -- Ordena os itens por nome do produto
      `;
      const { rows: itemRows } = await client.query(itemsQuery, [id]);

      // Adiciona os itens ao objeto de detalhes da saída
      exitDetails.items = itemRows;

      return exitDetails;

    } catch (error) {
      console.error(`Erro ao buscar saída por ID (${id}):`, error);
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = stockExitModel;