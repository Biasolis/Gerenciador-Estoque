const stockEntryModel = require('../models/stockEntryModel');
const stockExitModel = require('../models/stockExitModel');
const stockModel = require('../models/stockModel');
const db = require('../models/db'); // Importa db para transação no adjustStock

const stockController = {
  // ... (createEntry, getAllEntries, deleteEntry, getInventory inalterados) ...
    // Criar um novo registro de entrada
  async createEntry(req, res) {
    try {
      const user_id = req.user.id;
      const { product_id, quantity, unit_value, entry_date, notes } = req.body;
      if (!product_id || !quantity || unit_value === undefined) {
        return res.status(400).json({ message: 'Produto, quantidade e valor unitário são obrigatórios.' });
      }
      if (quantity <= 0) {
        return res.status(400).json({ message: 'A quantidade deve ser maior que zero.' });
      }
      const newEntry = await stockEntryModel.create({ product_id, quantity, unit_value, entry_date, user_id, notes });
      res.status(201).json(newEntry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao registrar entrada no estoque.' });
    }
  },

  // Listar todos os registros de entrada
  async getAllEntries(req, res) {
    try {
      const entries = await stockEntryModel.findAll();
      res.status(200).json(entries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar registros de entrada.' });
    }
  },

  // Excluir um registro de entrada (somente admin)
  async deleteEntry(req, res) {
    try {
        const { id } = req.params;
        const result = await stockEntryModel.remove(id);
        if (result === 0) {
            return res.status(404).json({ message: 'Registro de entrada não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir registro de entrada.' });
    }
  },

  // Buscar o status atual do inventário
  async getInventory(req, res) {
    try {
      const inventory = await stockModel.getInventoryStatus();
      res.status(200).json(inventory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar o status do inventário.' });
    }
  },

  // Função createExit MODIFICADA
  async createExit(req, res) {
    try {
      const user_id = req.user.id;
      const { items, requester_person_id, ticket_number, ticket_link, reason, delivery_date } = req.body;

      // Validações básicas
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Pelo menos um item deve ser adicionado à saída.' });
      }
      if (!requester_person_id) {
         return res.status(400).json({ message: 'O solicitante é obrigatório.' });
      }
      // ============================================
      // !! VALIDAÇÃO ADICIONADA NO BACKEND !!
      // ============================================
      if (!ticket_number || ticket_number.trim() === '') {
        return res.status(400).json({ message: 'O Nº do Ticket é obrigatório.' });
      }
      if (!ticket_link || ticket_link.trim() === '') {
        return res.status(400).json({ message: 'O Link do Ticket é obrigatório.' });
      }
      // ============================================

      // Valida cada item e verifica o estoque ANTES de iniciar a transação
      for (const item of items) {
        if (!item.product_id || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ message: 'Cada item deve ter produto e quantidade (maior que zero) válidos.' });
        }
         // Busca estoque atual DENTRO do loop para garantir o valor mais recente
         // antes de confirmar a transação (embora a transação ajude a prevenir race conditions)
        const currentStock = await stockModel.getCurrentStockForProduct(item.product_id);
        if (currentStock < parseInt(item.quantity, 10)) {
          // Busca nome do produto para mensagem de erro mais clara
          const productInfo = await db.query('SELECT name FROM products WHERE id = $1', [item.product_id]);
          const productName = productInfo.rows[0]?.name || `ID ${item.product_id}`;
          return res.status(400).json({
             message: `Estoque insuficiente para ${productName}. Quantidade disponível: ${currentStock}.`
          });
        }
      }

      const exitData = {
          ticket_number, ticket_link, reason, delivery_date, requester_person_id, user_id
      };

      const newExit = await stockExitModel.create(exitData, items);
      res.status(201).json(newExit);

    } catch (error) {
      console.error("Erro detalhado ao criar saída:", error.stack || error);
      // Verifica se é erro de violação de constraint (ex: estoque negativo se tivéssemos check constraint)
      if (error.code === '23514') { // Código PostgreSQL para check violation
           return res.status(400).json({ message: 'Erro de validação: Verifique as quantidades e o estoque disponível.' });
      }
      res.status(500).json({ message: 'Erro interno ao registrar saída do estoque.' });
    }
  },

  // Listar todos os registros de saída
  async getAllExits(req, res) {
    try {
      const exits = await stockExitModel.findAll();
      // Garante que os contadores sejam números
      const formattedExits = exits.map(exit => ({
        ...exit,
        distinct_items_count: parseInt(exit.distinct_items_count || 0, 10),
        total_quantity: parseInt(exit.total_quantity || 0, 10),
      }));
      res.status(200).json(formattedExits);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar registros de saída.' });
    }
  },

  // Buscar um registro de saída por ID
  async getExitById(req, res) {
    try {
        const { id } = req.params;
        const exit = await stockExitModel.findById(id);
        if (!exit) {
            return res.status(404).json({ message: 'Registro de saída não encontrado.' });
        }
        res.status(200).json(exit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar registro de saída.' });
    }
  },

  // Ajustar o estoque de um produto
  async adjustStock(req, res) {
    try {
      const { product_id, new_quantity, reason } = req.body;
      const user_id = req.user.id;

      if (product_id === undefined || new_quantity === undefined || !reason) {
        return res.status(400).json({ message: 'Produto, nova quantidade e motivo são obrigatórios.' });
      }

      const newQuantity = parseInt(new_quantity, 10);
      if (isNaN(newQuantity) || newQuantity < 0) {
        return res.status(400).json({ message: 'A nova quantidade deve ser um número igual ou maior que zero.' });
      }

      const currentStock = await stockModel.getCurrentStockForProduct(product_id);
      const difference = newQuantity - currentStock;

      if (difference === 0) {
        return res.status(200).json({ message: 'Nenhum ajuste necessário. A quantidade já é a informada.' });
      }

      const adjustmentNote = `Ajuste de inventário. Motivo: ${reason}`;

      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        if (difference > 0) {
          const entryQuery = `INSERT INTO stock_entries (product_id, quantity, unit_value, user_id, notes) VALUES ($1, $2, $3, $4, $5)`;
          await client.query(entryQuery, [product_id, difference, 0, user_id, adjustmentNote]);
        } else {
           // Cria uma Ordem de Saída específica para ajuste
          const exitQuery = `INSERT INTO stock_exits (reason, user_id, delivery_date, ticket_number, ticket_link) VALUES ($1, $2, NOW(), 'AJUSTE', 'N/A') RETURNING id`;
          const exitRes = await client.query(exitQuery, [adjustmentNote, user_id]);
          const exitId = exitRes.rows[0].id;

          const itemQuery = `INSERT INTO stock_exit_items (exit_id, product_id, quantity) VALUES ($1, $2, $3)`;
          // Garante que a quantidade é positiva
          await client.query(itemQuery, [exitId, product_id, Math.abs(difference)]);
        }
        await client.query('COMMIT');
        res.status(200).json({ message: 'Estoque ajustado com sucesso.' });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Erro ao ajustar estoque:', error.stack || error);
       if (error.code === '23514') { // Check violation (ex: estoque ficaria negativo)
           return res.status(400).json({ message: 'Ajuste inválido. Verifique o estoque disponível.' });
      }
      res.status(500).json({ message: 'Erro interno ao ajustar o estoque.' });
    }
  }
};

module.exports = stockController;