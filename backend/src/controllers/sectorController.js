const sectorModel = require('../models/sectorModel');

const sectorController = {
  // Criar novo setor
  async create(req, res) {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'O nome do setor é obrigatório.' });
      }
      const newSector = await sectorModel.create({ name, description });
      res.status(201).json(newSector);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar setor.' });
    }
  },

  // Listar todos os setores
  async getAll(req, res) {
    try {
      const sectors = await sectorModel.findAll();
      res.status(200).json(sectors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar setores.' });
    }
  },

  // Atualizar um setor
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'O nome do setor é obrigatório.' });
      }
      const updatedSector = await sectorModel.update(id, { name, description });
      if (!updatedSector) {
        return res.status(404).json({ message: 'Setor não encontrado.' });
      }
      res.status(200).json(updatedSector);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar setor.' });
    }
  },

  // Excluir um setor
  async deleteById(req, res) {
    try {
      const { id } = req.params;
      const result = await sectorModel.remove(id);
      if (result === 0) {
        return res.status(404).json({ message: 'Setor não encontrado.' });
      }
      // Resposta 204 No Content é padrão para exclusões bem-sucedidas
      res.status(204).send();
    } catch (error) {
      console.error(error);
      // Tratamento de erro para chave estrangeira (se um setor está em uso)
      if (error.code === '23503') {
        return res.status(409).json({ message: 'Este setor não pode ser excluído pois está vinculado a uma pessoa.' });
      }
      res.status(500).json({ message: 'Erro ao excluir setor.' });
    }
  }
};

module.exports = sectorController;