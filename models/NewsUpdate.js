const pool = require('../dbConfig/db');

class NewsUpdate {
  static async create({ urls, createdBy, body, title }) {
    console.log("uid:"+ createdBy,body)
    const [result] = await pool.execute(
      
      'INSERT INTO news_update (urls, createdBy, body, title) VALUES (?, ?, ?, ?)',
      [urls, createdBy, body, title]
    );
    return this.getById(result.insertId);
  }

  static async getById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM news_update WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getByUser(createdBy) {
    const [rows] = await pool.execute(
      'SELECT * FROM news_update WHERE createdBy = ? ORDER BY created_at DESC',
      [createdBy]
    );
    return rows;
  }

  static async update(id, createdBy, { urls, body, title }) {
    await pool.execute(
      'UPDATE news_update SET urls = ?, body = ?, title = ? WHERE id = ? AND createdBy = ?',
      [urls, body, title, id, createdBy]
    );
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM news_update WHERE id = ? ',
      [id]
    );
    return result.affectedRows > 0;
  }

static async getAll() {
  const [rows] = await pool.execute(`
    SELECT 
      n.id,
      n.urls,
      n.body,
      n.title,
      n.created_at,
      n.updated_at,
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
    FROM news_update n
    JOIN profile p ON n.createdBy = p.uid
    ORDER BY n.created_at DESC
  `);
  
  return rows.map(row => ({
    id: row.id,
    urls: row.urls,
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

module.exports = NewsUpdate;