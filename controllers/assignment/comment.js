const Comment = require('../../models/assignment/comment');

const CommentController = {
  create: (req, res) => {
    Comment.create(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "Comment added successfully", id: result.insertId });
    });
  },

  getByAssignment: (req, res) => {
    Comment.getByAssignment(req.params.assignmentId, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  },

  delete: (req, res) => {
    Comment.delete(req.params.id, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Comment deleted successfully" });
    });
  }
};

module.exports = CommentController;
