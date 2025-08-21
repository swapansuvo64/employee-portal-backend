const Files = require("../../models/ClinetOps/files");

class FilesController {
  static async createFile(req, res) {
    try {
      const newFile = await Files.create(req.body);
      res.status(201).json(newFile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateFile(req, res) {
    try {
      const { id } = req.params;
      const updatedFile = await Files.update(id, req.body);
      res.json(updatedFile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteFile(req, res) {
    try {
      const { id } = req.params;
      const result = await Files.delete(id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAllFiles(req, res) {
    try {
      const files = await Files.getAll();
      res.json(files);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getFilesByProjectId(req, res) {
    try {
      const { projectId } = req.params;
      const files = await Files.getByProjectId(projectId);
      res.json(files);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = FilesController;
