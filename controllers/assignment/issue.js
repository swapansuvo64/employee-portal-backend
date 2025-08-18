const Issue = require('../../models/assignment/issue');

const IssueController = {
  create: (req, res) => {
    Issue.create(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "Issue added successfully", id: result.insertId });
    });
  },

  getByAssignment: (req, res) => {
    Issue.getByAssignment(req.params.assignmentId, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  },

  delete: (req, res) => {
    Issue.delete(req.params.id, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Issue deleted successfully" });
    });
  }
};

module.exports = IssueController;
