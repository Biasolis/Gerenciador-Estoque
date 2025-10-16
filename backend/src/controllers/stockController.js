const stockEntryModel = require('../models/stockEntryModel');
const stockExitModel = require('../models/stockExitModel');
const stockModel = require('../models/stockModel');

const stockController = {
  // Criar um novo registro de entrada
  async createEntry(req, res) {
    try {
      const user_id = req.user.id;
      const { product_id, quantity, unit_value, entry_date } = req.body;
      if (!product_id || !quantity || unit_value === undefined) {
        return res.status(400).json({ message: 'Produto, quantidade e valor unitário são obrigatórios.' });
      }
      if (quantity <= 0) {
        return res.status(400).json({ message: 'A quantidade deve ser maior que zero.' });
      }
      const newEntry = await stockEntryModel.create({ product_id, quantity, unit_value, entry_date, user_id });
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
  
  // Criar um novo registro de saída
  async createExit(req, res) {
    try {
      const user_id = req.user.id;
      const { product_id, quantity, requester_person_id } = req.body;

      if (!product_id || !quantity || !requester_person_id) {
        return res.status(400).json({ message: 'Produto, quantidade e solicitante são obrigatórios.' });
      }
      
      const currentStock = await stockModel.getCurrentStockForProduct(product_id);

      if (currentStock < parseInt(quantity, 10)) {
        return res.status(400).json({ message: `Estoque insuficiente. Quantidade disponível: ${currentStock}.` });
      }
      
      const newExit = await stockExitModel.create({ ...req.body, user_id });
      res.status(201).json(newExit);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao registrar saída do estoque.' });
    }
  },

  // Listar todos os registros de saída
  async getAllExits(req, res) {
    try {
      const exits = await stockExitModel.findAll();
      res.status(200).json(exits);
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

      if (!product_id || new_quantity === undefined || !reason) {
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

      if (difference > 0) {
        // Aumentou o estoque -> Cria uma ENTRADA
        await stockEntryModel.create({
          product_id,
          quantity: difference,
          unit_value: 0, // Valor 0 para não impactar relatórios financeiros
          user_id,
          notes: adjustmentNote,
        });
      } else {
        // Diminuiu o estoque -> Cria uma SAÍDA
        await stockExitModel.create({
          product_id,
          quantity: Math.abs(difference), // Usa o valor absoluto da diferença
          requester_person_id: null, // Saída de ajuste não tem solicitante
          reason: adjustmentNote,
          user_id,
        });
      }

      res.status(200).json({ message: 'Estoque ajustado com sucesso.' });

    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      res.status(500).json({ message: 'Erro interno ao ajustar o estoque.' });
    }
  }
};

module.exports = stockController;