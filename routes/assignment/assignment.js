const express = require('express');
const router = express.Router();
const AssignmentController = require('../../controllers/assignment/assignment');
const authMiddleware = require('../../middleware/authMiddleware');
router.post('/',authMiddleware.authenticate, AssignmentController.create);
router.get('/',authMiddleware.authenticate, AssignmentController.getAll);
router.get('/:id',authMiddleware.authenticate, AssignmentController.getById);
router.put('/:id',authMiddleware.authenticate, AssignmentController.update);
router.delete('/:id',authMiddleware.authenticate, AssignmentController.delete);

module.exports = router;
