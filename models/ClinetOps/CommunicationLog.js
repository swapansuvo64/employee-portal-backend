const pool = require("../../dbConfig/db");

class CommunicationLog {
  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM communication_log ORDER BY created_at DESC");
    return rows;
  }

static async getByProjectId(projectId) {
    const [rows] = await pool.query(
      "SELECT * FROM communication_log WHERE projectId = ? ORDER BY created_at DESC",
      [projectId]
    );
    return rows;
  }

static async create({ log_date,note, communication_type, projectId, createdBy }) {
  const [result] = await pool.query(
    "INSERT INTO communication_log (log_date,note, communication_type, projectId, createdBy) VALUES (?, ?, ?, ?, ?)",
    [log_date,note, communication_type, projectId, createdBy]
  );
  return { id: result.insertId };
}

static async update(id, { log_date,note, communication_type }) {
  const [result] = await pool.query(
    "UPDATE communication_log SET log_date = ?,note=?, communication_type = ? WHERE id = ?",
    [log_date,note, communication_type, id]
  );
  return result.affectedRows;
}

static async delete(id) {
    const [result] = await pool.query("DELETE FROM communication_log WHERE id = ?", [id]);
    return result.affectedRows;
  }


}

module.exports = CommunicationLog;
