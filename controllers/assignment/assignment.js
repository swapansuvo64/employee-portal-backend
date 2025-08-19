const Assignment = require('../../models/assignment/assignment');

const AssignmentController = {
  create: (req, res) => {
    Assignment.create(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "Assignment created successfully", id: result.insertId });
    });
  },

getAll: async (req, res) => {
  try {
    //console.log("called");
    const results = await Assignment.getAll();  // ✅ now using async/await
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
,

  getById: (req, res) => {
    Assignment.getById(req.params.id, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (!result.length) return res.status(404).json({ message: "Assignment not found" });
      res.json(result[0]);
    });
  },

update: async (req, res) => {
    try {
      const result = await Assignment.update(req.params.id, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json({ message: "Assignment updated successfully", id: req.params.id });
    } catch (err) {
      console.error('Update error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  delete: (req, res) => {
    Assignment.delete(req.params.id, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Assignment deleted successfully" });
    });
  }
};

module.exports = AssignmentController;
