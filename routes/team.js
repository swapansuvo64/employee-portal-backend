const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team');

// CRUD Routes
router.get('/', teamController.getAllTeams);       // Get all teams
router.get('/:id', teamController.getTeamById);    // Get team by ID
router.post('/', teamController.createTeam);       // Create new team
router.put('/:id', teamController.updateTeam);     // Update team
router.delete('/:id', teamController.deleteTeam);  // Delete team

module.exports = router;
