const CommunicationLog = require("../../models/ClinetOps/CommunicationLog");

class CommunicationLogController {
  static async getAll(req, res) {
    try {
      const logs = await CommunicationLog.getAll();
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getByProjectId(req, res) {
    try {
      const { projectId } = req.params;
      const logs = await CommunicationLog.getByProjectId(projectId);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { log_date,note, communication_type,projectstageIndex, projectId, createdBy } = req.body;
      const result = await CommunicationLog.create({ log_date,note, communication_type,projectstageIndex, projectId, createdBy });
      res.status(201).json({ message: "Log created", id: result.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { log_date, note,communication_type,projectstageIndex } = req.body;
      const updated = await CommunicationLog.update(id, { log_date,note, communication_type,projectstageIndex });
      if (!updated) return res.status(404).json({ message: "Log not found" });
      res.json({ message: "Log updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await CommunicationLog.delete(id);
      if (!deleted) return res.status(404).json({ message: "Log not found" });
      res.json({ message: "Log deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = CommunicationLogController;
