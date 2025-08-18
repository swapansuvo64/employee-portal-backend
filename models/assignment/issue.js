const db = require('../../dbConfig/db');

const Issue = {
  create: (data, callback) => {
    const sql = `
      INSERT INTO issue (assignmentId, issueText, issueUserId, createdAt) 
      VALUES (?, ?, ?, NOW())
    `;
    db.query(sql, [
      data.assignmentId,
      data.issueText,
      data.issueUserId
    ], callback);
  },

  getByAssignment: (assignmentId, callback) => {
    db.query("SELECT * FROM issue WHERE assignmentId = ?", [assignmentId], callback);
  },

  delete: (id, callback) => {
    db.query("DELETE FROM issue WHERE id = ?", [id], callback);
  }
};

module.exports = Issue;
