const Insight = require('../model/insight');

const insightController = {
  createInsight: async (req, res) => {
    try {
      const { urls, tags, body, title } = req.body;
      const createdBy = req.user.uid;
      const insight = await Insight.create({ urls, tags, createdBy, body, title });
      res.status(201).json(insight);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getInsight: async (req, res) => {
    try {
      const insight = await Insight.getById(req.params.id);
      if (!insight) {
        return res.status(404).json({ message: 'Insight not found' });
      }
      res.json(insight);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUserInsights: async (req, res) => {
    try {
      const insights = await Insight.getByUser(req.params.userId);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllInsights: async (req, res) => {
    try {
      const insights = await Insight.getAll();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateInsight: async (req, res) => {
    try {
      const { id } = req.params;
      const { urls, tags, body, title } = req.body;
      const createdBy = req.user.uid;
      const insight = await Insight.update(id, createdBy, { urls, tags, body, title });
      res.json(insight);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteInsight: async (req, res) => {
    try {
      const { id } = req.params;
      const createdBy = req.user.uid;
      const success = await Insight.delete(id, createdBy);
      if (!success) {
        return res.status(404).json({ message: 'Insight not found or not authorized' });
      }
      res.json({ message: 'Insight deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = insightController;