const NewsUpdate = require('../models/NewsUpdate');
const authMiddleware = require('../middleware/authMiddleware');

class NewsUpdateController {
  static async create(req, res) {
    try {
      const { urls, body, title } = req.body;
      const createdBy = req.user.id; // From auth middleware

      const newsItem = await NewsUpdate.create({ urls, createdBy, body, title });
      
      res.status(201).json({
        success: true,
        data: newsItem
      });
    } catch (error) {
      console.error('Error creating news update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create news update'
      });
    }
  }

  static async getByUser(req, res) {
    try {
      const createdBy = req.user.id; // From auth middleware
      const newsItems = await NewsUpdate.getByUser(createdBy);
      
      res.json({
        success: true,
        data: newsItems
      });
    } catch (error) {
      console.error('Error fetching user news:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch news updates'
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const createdBy = req.user.id;
      const { urls, body, title } = req.body;

      const updatedItem = await NewsUpdate.update(id, createdBy, { urls, body, title });
      
      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: 'News update not found or unauthorized'
        });
      }

      res.json({
        success: true,
        data: updatedItem
      });
    } catch (error) {
      console.error('Error updating news:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update news'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const createdBy = req.user.id;

      const deleted = await NewsUpdate.delete(id, createdBy);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'News update not found or unauthorized'
        });
      }

      res.json({
        success: true,
        message: 'News update deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting news:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete news update'
      });
    }
  }

  static async getAll(req, res) {
    try {
      const newsItems = await NewsUpdate.getAll();
      
      res.json({
        success: true,
        data: newsItems
      });
    } catch (error) {
      console.error('Error fetching all news:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch news updates'
      });
    }
  }
}

module.exports = NewsUpdateController;