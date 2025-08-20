const express = require('express');
const router = express.Router();
const AssignmentController = require('../../controllers/assignment/assignment');
const authMiddleware = require('../../middleware/authMiddleware');
router.post('/',authMiddleware.authenticate, AssignmentController.create);
router.get('/',authMiddleware.authenticate, AssignmentController.getAll);
router.get('/:id',authMiddleware.authenticate, AssignmentController.getById);
router.put('/:id',authMiddleware.authenticate, AssignmentController.update);
router.delete('/:id',authMiddleware.authenticate, AssignmentController.delete);


router.get('/assigned-person/:assignedPersonId',authMiddleware.authenticate, AssignmentController.getAssignmentsByAssignedPerson);
router.put('/assigned-person/:assignedPersonId',authMiddleware.authenticate, AssignmentController.updateAssignmentsByAssignedPerson);


// GET assignments by projectId
router.get('/project/:projectId',authMiddleware.authenticate,  AssignmentController.getAssignmentsByProjectId);
module.exports = router;
