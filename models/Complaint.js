const pool = require('../dbConfig/db');

const complaints = {
  create: async (data) => {
    const { title, category, priority, description, urls, createdBy, isAnonymous } = data;
    const [result] = await pool.execute(
      `INSERT INTO complaints 
        (title, category, priority, description, urls, createdBy, isAnonymous) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        category, 
        priority || 'Low', 
        description, 
        urls || null, 
        createdBy, 
        isAnonymous || 0
      ]
    );
    return result;
  },

  getAll: async () => {
    const [rows] = await pool.execute(`
      SELECT 
        c.*, 
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
      FROM complaints c
      JOIN profile p 
        ON c.createdBy = p.uid
      ORDER BY c.createdDate DESC
    `);
    return rows;
  }
};

module.exports = complaints;