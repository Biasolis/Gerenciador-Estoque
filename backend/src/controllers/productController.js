const productModel = require('../models/productModel');

const productController = {
  // Criar novo produto
  async create(req, res) {
    try {
      const { name, description, model } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'O nome do produto é obrigatório.' });
      }
      const newProduct = await productModel.create({ name, description, model });
      res.status(201).json(newProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar produto.' });
    }
  },

  // Listar todos os produtos
  async getAll(req, res) {
    try {
      const products = await productModel.findAll();
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar produtos.' });
    }
  },

  // Atualizar um produto
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, model } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'O nome do produto é obrigatório.' });
      }
      const updatedProduct = await productModel.update(id, { name, description, model });
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar produto.' });
    }
  },

  // Excluir um produto
  async deleteById(req, res) {
    try {
      const { id } = req.params;
      const result = await productModel.remove(id);
      if (result === 0) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      if (error.code === '23503') { // Chave estrangeira
        return res.status(409).json({ message: 'Este produto não pode ser excluído pois possui registros de entrada ou saída no estoque.' });
      }
      res.status(500).json({ message: 'Erro ao excluir produto.' });
    }
  }
};

module.exports = productController;