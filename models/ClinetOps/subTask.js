const pool = require("../../dbConfig/db");

class SubTask {
  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM subTask ORDER BY createdAt DESC");
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM subTask WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByProjectId(projectId) {
    const [rows] = await pool.query(
      "SELECT * FROM subTask WHERE ProjectId = ? ORDER BY projectstageIndex, createdAt",
      [projectId]
    );
    return rows;
  }

  static async create(subTaskData) {
    const { ProjectId, projectstageIndex, Task, createdBy, IsCompleted } = subTaskData;
    const [result] = await pool.query(
      "INSERT INTO subTask (ProjectId, projectstageIndex, Task, createdBy, IsCompleted) VALUES (?, ?, ?, ?, ?)",
      [ProjectId, projectstageIndex, Task, createdBy, IsCompleted || false]
    );
    return { id: result.insertId, ...subTaskData };
  }

  static async update(id, subTaskData) {
    const { ProjectId, projectstageIndex, Task, createdBy, IsCompleted } = subTaskData;
    await pool.query(
      "UPDATE subTask SET ProjectId = ?, projectstageIndex = ?, Task = ?, createdBy = ?, IsCompleted = ? WHERE id = ?",
      [ProjectId, projectstageIndex, Task, createdBy, IsCompleted, id]
    );
    return { id, ...subTaskData };
  }

  static async delete(id) {
    await pool.query("DELETE FROM subTask WHERE id = ?", [id]);
    return true;
  }

  static async toggleComplete(id) {
    const [result] = await pool.query(
      "UPDATE subTask SET IsCompleted = NOT IsCompleted WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = SubTask;