const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insight');
const authMiddleware = require('../middleware/authMiddleware');

// Create an insight
router.post('/:userId',  authMiddleware.authenticate, insightController.createInsight);

// Get all insights
router.get('/',  authMiddleware.authenticate,insightController.getAllInsights);

// Get a specific insight
router.get('/:id', authMiddleware.authenticate, insightController.getInsight);

// Get insights by user
router.get('/user/:userId', authMiddleware.authenticate, insightController.getUserInsights);

// Update an insight
router.put('/:id',  authMiddleware.authenticate, insightController.updateInsight);

// Delete an insight
router.delete('/:id',  authMiddleware.authenticate, insightController.deleteInsight);

module.exports = router;