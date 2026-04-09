const { Glamp } = require('../models');

const glampController = {
  // Получить все дома
  async getAllGlamps(req, res) {
    try {
      const glambs = await Glamp.findAll({
        where: { isAvailable: true },
        order: [['createdAt', 'DESC']]
      });
      res.json({ success: true, data: glambs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Получить дом по ID
  async getGlampById(req, res) {
    try {
      const glamp = await Glamp.findByPk(req.params.id);
      if (!glamp) {
        return res.status(404).json({ success: false, error: 'Glamp not found' });
      }
      res.json({ success: true, data: glamp });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Создать дом
  async createGlamp(req, res) {
    try {
      const glamp = await Glamp.create(req.body);
      res.status(201).json({ success: true, data: glamp });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Обновить дом
  async updateGlamp(req, res) {
    try {
      const glamp = await Glamp.findByPk(req.params.id);
      if (!glamp) {
        return res.status(404).json({ success: false, error: 'Glamp not found' });
      }
      await glamp.update(req.body);
      res.json({ success: true, data: glamp });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Удалить дом
  async deleteGlamp(req, res) {
    try {
      const glamp = await Glamp.findByPk(req.params.id);
      if (!glamp) {
        return res.status(404).json({ success: false, error: 'Glamp not found' });
      }
      await glamp.destroy();
      res.json({ success: true, message: 'Glamp deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = glampController;