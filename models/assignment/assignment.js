const db = require('../../dbConfig/db');

const Assignment = {
  create: async (data) => {
    const sql = `
      INSERT INTO assignment 
      (assignedPerson, task, startDate, endDate, isCompleted, comment, commentUserId, issue, issueUserId, projectId, urls, status, createdBy) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      data.assignedPerson,
      data.task,
      data.startDate,
      data.endDate,
      data.isCompleted || false,
      data.comment,
      data.commentUserId,
      data.issue,
      data.issueUserId,
      data.projectId,
      data.urls,
      data.status,
      data.createdBy
    ]);
    return result;
  },

  getAll: async () => {
    
    const [rows] = await db.query("SELECT * FROM assignment");
    console.log(rows)
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM assignment WHERE id = ?", [id]);
    return rows;
  },

  update: async (id, data) => {
    const sql = `
      UPDATE assignment SET 
      assignedPerson=?, task=?, startDate=?, endDate=?, isCompleted=?, comment=?, 
      commentUserId=?, issue=?, issueUserId=?, projectId=?, urls=?, status=?, createdBy=? 
      WHERE id=?
    `;
    const [result] = await db.query(sql, [
      data.assignedPerson,
      data.task,
      data.startDate,
      data.endDate,
      data.isCompleted,
      data.comment,
      data.commentUserId,
      data.issue,
      data.issueUserId,
      data.projectId,
      data.urls,
      data.status,
      data.createdBy,
      id
    ]);
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM assignment WHERE id = ?", [id]);
    return result;
  }
};

module.exports = Assignment;
