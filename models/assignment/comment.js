const db = require('../../dbConfig/db');

const Comment = {
  create: (data, callback) => {
    const sql = `
      INSERT INTO comment (assignmentId, commentText, commentUserId, createdAt) 
      VALUES (?, ?, ?, NOW())
    `;
    db.query(sql, [
      data.assignmentId,
      data.commentText,
      data.commentUserId
    ], callback);
  },

  getByAssignment: (assignmentId, callback) => {
    db.query("SELECT * FROM comment WHERE assignmentId = ?", [assignmentId], callback);
  },

  delete: (id, callback) => {
    db.query("DELETE FROM comment WHERE id = ?", [id], callback);
  }
};

module.exports = Comment;
