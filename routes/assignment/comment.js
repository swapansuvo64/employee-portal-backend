const express = require('express');
const router = express.Router();
const CommentController = require('../../controllers/assignment/comment');
const authMiddleware = require('../../middleware/authMiddleware');
router.post('/',authMiddleware.authenticate,  CommentController.create);
router.get('/assignment/:assignmentId',authMiddleware.authenticate,  CommentController.getByAssignment);
router.delete('/:id',authMiddleware.authenticate,  CommentController.delete);

module.exports = router;
