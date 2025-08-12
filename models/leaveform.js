const pool = require('../dbConfig/db');

const LeaveForm = {
  create: async (data) => {
    const { type, startDate, endDate, reason, urls, createdBy } = data;
    const [result] = await pool.execute(
      `INSERT INTO leaveForm (type, startDate, endDate, reason, urls, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, startDate, endDate, reason, urls || null, createdBy]
    );
    return result;
  },

  getAll: async () => {
    const [rows] = await pool.execute(`
    SELECT 
      lf.*, 
      p.username,
      p.firstname,
      p.lastname,
      p.profilepicurl,
      p.role,
      p.designation,
      p.email,
      p.phonno,
      p.location,
      p.department,
      p.bio,
      p.joindate,
      p.manager
    FROM leaveForm lf
    JOIN profile p 
      ON lf.createdBy = p.uid
    ORDER BY lf.createdDate DESC
  `);
    return rows;
  }

};

module.exports = LeaveForm;
