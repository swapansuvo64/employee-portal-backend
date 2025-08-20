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
  //  console.log(rows)
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM assignment WHERE id = ?", [id]);
    return rows;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key}=?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return { affectedRows: 0 }; // Return empty result if nothing to update
    }

    const sql = `UPDATE assignment SET ${fields.join(", ")} WHERE id=?`;
    values.push(id);

    const [result] = await db.query(sql, values);
    return result;
  },


  delete: async (id) => {
    const [result] = await db.query("DELETE FROM assignment WHERE id = ?", [id]);
    return result;
  },



  //-------------------------------------------------------------------------------

  getByAssignedPerson: async (assignedPersonId) => {
    const [rows] = await db.query("SELECT * FROM assignment WHERE assignedPerson = ?", [assignedPersonId]);
    return rows;
  },
  // NEW: Update assignments by assignedPerson
  updateByAssignedPerson: async (assignedPersonId, data) => {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key}=?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return { affectedRows: 0 }; // Return empty result if nothing to update
    }

    const sql = `UPDATE assignment SET ${fields.join(", ")} WHERE assignedPerson=?`;
    values.push(assignedPersonId);

    const [result] = await db.query(sql, values);
    return result;
  },

  //---------------------------------------------------------------------------------
   getByProjectId: async (projectId) => {
    const [rows] = await db.query("SELECT * FROM assignment WHERE projectId = ?", [projectId]);
    return rows;
  },



};

module.exports = Assignment;
