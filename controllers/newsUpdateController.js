const NewsUpdate = require('../models/NewsUpdate');
const authMiddleware = require('../middleware/authMiddleware');
const { Op } = require('sequelize');
const pool = require('../dbConfig/db'); // Add this line
let i=0
class NewsUpdateController {
static async create(req, res) {
  console.log('Request received:', {
    body: req.body,
    time: new Date().toISOString()
  });

  try {
    const { title, body, urls, createdBy } = req.body;

    // 1. Check for duplicates within the last 5 seconds
    const [existing] = await pool.execute(
      `SELECT * FROM news_update 
       WHERE title = ? AND body = ? AND createdBy = ? 
       AND created_at > DATE_SUB(NOW(), INTERVAL 5 SECOND)`,
      [title, body, createdBy]
    );

    if (existing.length > 0) {
      console.log('Duplicate detected, skipping creation silently.');
      return res.status(200).json({
        success: true,
        data: existing[0] // return existing item to keep frontend happy
      });
    }

    // 2. Create the news item
    const newsItem = await NewsUpdate.create({
      urls,
      createdBy,
      body,
      title
    });
    
    res.status(201).json({
      success: true,
      data: newsItem
    });
  } catch (error) {
    console.error('Creation error:', error);
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
     // const createdBy = req.user.id;
      const { urls, body, title,createdBy } = req.body;

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
      //const createdBy = req.user.id;

      const deleted = await NewsUpdate.delete(id);
      
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