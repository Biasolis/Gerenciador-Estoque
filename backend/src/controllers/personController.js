const personModel = require('../models/personModel');

const personController = {
  // Criar nova pessoa
  async create(req, res) {
    try {
      const { name, email, extension_line, sector_id } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'O nome do colaborador é obrigatório.' });
      }
      const newPerson = await personModel.create({ name, email, extension_line, sector_id });
      res.status(201).json(newPerson);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao criar colaborador.' });
    }
  },

  // Listar todas as pessoas
  async getAll(req, res) {
    try {
      const people = await personModel.findAll();
      res.status(200).json(people);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar colaboradores.' });
    }
  },

  // Atualizar uma pessoa
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, extension_line, sector_id } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'O nome do colaborador é obrigatório.' });
      }
      const updatedPerson = await personModel.update(id, { name, email, extension_line, sector_id });
      if (!updatedPerson) {
        return res.status(404).json({ message: 'Colaborador não encontrado.' });
      }
      res.status(200).json(updatedPerson);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar colaborador.' });
    }
  },

  // Excluir uma pessoa
  async deleteById(req, res) {
    try {
      const { id } = req.params;
      const result = await personModel.remove(id);
      if (result === 0) {
        return res.status(404).json({ message: 'Colaborador não encontrado.' });
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
       if (error.code === '23503') {
        return res.status(409).json({ message: 'Este colaborador não pode ser excluído pois está vinculado a uma saída de estoque.' });
      }
      res.status(500).json({ message: 'Erro ao excluir colaborador.' });
    }
  }
};

module.exports = personController;