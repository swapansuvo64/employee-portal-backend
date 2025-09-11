const ExpectedDateLog = require("../../models/ClinetOps/expectedDateLog")
class ExpectedDateLogController{
    static async getByProjectId(req, res) {
    try {
      const { projectId } = req.params;
      const logs = await ExpectedDateLog.getByProjectId(projectId);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}