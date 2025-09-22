const pool = require("../../dbConfig/db");

class Files {
  static async create({ fileName, fileLink, fileType, Notes, projectId, createdBy ,projectstageIndex }) {
    const [result] = await pool.query(
      `INSERT INTO files (fileName, fileLink, fileType, Notes, projectId, createdBy,projectstageIndex) 
       VALUES (?, ?, ?, ?, ?, ?,?)`,
      [fileName, fileLink, fileType, Notes, projectId, createdBy,projectstageIndex]
    );
    return { id: result.insertId, fileName, fileLink, fileType, Notes, projectId, createdBy,projectstageIndex };
  }

  static async update(id, { fileName, fileLink, fileType, Notes,projectstageIndex }) {
    await pool.query(
      `UPDATE files SET fileName=?, fileLink=?, fileType=?, Notes=? projectstageIndex=? WHERE id=?`,
      [fileName, fileLink, fileType, Notes,projectstageIndex, id]
    );
    return { id, fileName, fileLink, fileType, Notes ,projectstageIndex};
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
