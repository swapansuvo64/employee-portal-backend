const pool = require('../dbConfig/db');

class Insight {
  static async create({ urls, tags, createdBy, body, title }) {
    const [result] = await pool.execute(
      'INSERT INTO insight (urls, tags, createdBy, body, title) VALUES (?, ?, ?, ?, ?)',
      [urls, tags, createdBy, body, title]
    );
    return this.getById(result.insertId);
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM insight WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getByUser(createdBy) {
    const [rows] = await pool.execute(
      'SELECT * FROM insight WHERE createdBy = ? ORDER BY created_at DESC',
      [createdBy]
    );
    return rows;
  }

  static async update(id, createdBy, { urls, tags, body, title }) {
    await pool.execute(
      'UPDATE insight SET urls = ?, tags = ?, body = ?, title = ? WHERE id = ? AND createdBy = ?',
      [urls, tags, body, title, id, createdBy]
    );
    return this.getById(id);
  }

  static async delete(id, createdBy) {
    const [result] = await pool.execute(
      'DELETE FROM insight WHERE id = ? AND createdBy = ?',
      [id, createdBy]
    );
    return result.affectedRows > 0;
  }

  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT 
        i.id,
        i.urls,
        i.tags,
        i.body,
        i.title,
        i.created_at,
        i.updated_at,
        p.uid,
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
      FROM insight i
      JOIN profile p ON i.createdBy = p.uid
      ORDER BY i.created_at DESC
    `);
    
    return rows.map(row => ({
      id: row.id,
      urls: row.urls,
      tags: row.tags,
      body: row.body,
      title: row.title,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        uid: row.uid,
        username: row.username,
        firstname: row.firstname,
        lastname: row.lastname,
        profilepicurl: row.profilepicurl,
        role: row.role,
        designation: row.designation,
        email: row.email,
        phonno: row.phonno,
        location: row.location,
        department: row.department,
        bio: row.bio,
        joindate: row.joindate,
        manager: row.manager
      }
    }));
  }
}

module.exports = Insight;