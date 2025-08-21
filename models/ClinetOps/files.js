const pool = require("../../dbConfig/db");

class Files {
  static async create({ fileName, fileLink, fileType, Notes, projectId, createdBy }) {
    const [result] = await pool.query(
      `INSERT INTO files (fileName, fileLink, fileType, Notes, projectId, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fileName, fileLink, fileType, Notes, projectId, createdBy]
    );
    return { id: result.insertId, fileName, fileLink, fileType, Notes, projectId, createdBy };
  }

  static async update(id, { fileName, fileLink, fileType, Notes }) {
    await pool.query(
      `UPDATE files SET fileName=?, fileLink=?, fileType=?, Notes=? WHERE id=?`,
      [fileName, fileLink, fileType, Notes, id]
    );
    return { id, fileName, fileLink, fileType, Notes };
  }

  static async delete(id) {
    await pool.query(`DELETE FROM files WHERE id=?`, [id]);
    return { message: "File deleted successfully" };
  }

  static async getAll() {
    const [rows] = await pool.query(`SELECT * FROM files ORDER BY createdAt DESC`);
    return rows;
  }

  static async getByProjectId(projectId) {
    const [rows] = await pool.query(`SELECT * FROM files WHERE projectId=? ORDER BY createdAt DESC`, [projectId]);
    return rows;
  }
}

module.exports = Files;
