const express = require('express');
const router = express.Router();
const projectController = require('../../controllers/ClientOps/projectController');

// @route   GET /api/projects/cards
// @desc    Get all projects formatted for cards display
// @access  Public
router.get('/cards', projectController.getAllProjectsForCards);

// @route   GET /api/projects/:id
// @desc    Get full project details by ID
// @access  Public
router.get('/:id', projectController.getProjectById);

module.exports = router;