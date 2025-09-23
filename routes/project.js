const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project');
const authMiddleware = require('../middleware/authMiddleware');
router.get('/',authMiddleware.authenticate, projectController.getAllProjects);
router.get('/:id',authMiddleware.authenticate, projectController.getProjectById);
router.post('/', authMiddleware.authenticate,projectController.createProject);
router.put('/:id',authMiddleware.authenticate, projectController.updateProject);
router.delete('/:id',authMiddleware.authenticate, projectController.deleteProject);
router.patch('/:id/terminate', projectController.terminateProject);

module.exports = router;
