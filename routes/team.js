const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team');
const authMiddleware = require('../middleware/authMiddleware');
// CRUD Routes
router.get('/',authMiddleware.authenticate, teamController.getAllTeams);       // Get all teams
router.get('/:id',authMiddleware.authenticate, teamController.getTeamById);    // Get team by ID
router.post('/', authMiddleware.authenticate,teamController.createTeam);       // Create new team
router.put('/:id',authMiddleware.authenticate, teamController.updateTeam);     // Update team
router.delete('/:id',authMiddleware.authenticate, teamController.deleteTeam);  // Delete team

module.exports = router;
