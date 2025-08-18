const express = require('express');
const router = express.Router();
const IssueController = require('../../controllers/assignment/issue');
const authMiddleware = require('../../middleware/authMiddleware');
router.post('/',authMiddleware.authenticate, IssueController.create);
router.get('/assignment/:assignmentId',authMiddleware.authenticate, IssueController.getByAssignment);
router.delete('/:id',authMiddleware.authenticate, IssueController.delete);

module.exports = router;
