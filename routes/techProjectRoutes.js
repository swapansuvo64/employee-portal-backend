const express =require('express');
const router =express.Router();
const techProjectController = require('../controllers/techProjectController');
const authMiddleware = require('../middleware/authMiddleware');
router.get('/', techProjectController.getAllTechProjects);       // Get all tech projects
router.get('/:id', techProjectController.getAllTechProjectsById);
router.post('/', techProjectController.createTechProject);       // Create new tech project
router.put('/:id', techProjectController.updateTechProject);     // Update tech project
router.delete('/:id', techProjectController.deleteTechProject);  // Delete tech project
module.exports = router;