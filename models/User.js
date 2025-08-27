const bcrypt = require('bcrypt');
const authPool = require('../dbConfig/authdDb');
const pool = require('../dbConfig/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret-key-123';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = 10;

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS User (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        employeeToken VARCHAR(255),
        clientToken VARCHAR(255),
        uid VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await authPool.query(query);
    console.log('User table created or already exists');
  }

  static generateUID(name, createdAt, id) {
    const firstLetter = name.charAt(0).toUpperCase();
    const date = new Date(createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    const dateStr = `${day}${month}${year}`;
    
    return `${firstLetter}${dateStr}${id}`;
  }

  static async createUser(name, password, role) {
    const passwordHash = await this.hashPassword(password);

    // Step 1: Insert user into the User table (authPool)
    const query = 'INSERT INTO User (name, password, role) VALUES (?, ?, ?)';
    const [result] = await authPool.execute(query, [name, passwordHash, role]);

    // Step 2: Get newly created user
    const user = await this.findUserById(result.insertId);

    // Step 3: Generate UID
    const uid = this.generateUID(name, user.createdAt, user.id);

    // Step 4: Update the User table with UID
    await authPool.execute('UPDATE User SET uid = ? WHERE id = ?', [uid, user.id]);

    // Step 5: Create corresponding entry in the Profile table (normal pool)
    const profileQuery = `
      INSERT INTO profile (username, uid, firstname, lastname, profilepicurl, created_at, updated_at, role, designation)
      VALUES (?, ?, '', '', '', NOW(), NOW(), ?, '')
    `;
    await pool.execute(profileQuery, [name, uid, role]);

    return { id: result.insertId, uid };
  }

  static async deleteUser(uid) {
    const connectionAuth = await authPool.getConnection();
    const connectionMain = await pool.getConnection();

    try {
      // Begin transactions in both DBs
      await connectionAuth.beginTransaction();
      await connectionMain.beginTransaction();

      // 1️⃣ Delete from Profile table (main DB)
      await connectionMain.execute(
        'DELETE FROM profile WHERE uid = ?',
        [uid]
      );

      // 2️⃣ Delete from User table (auth DB)
      await connectionAuth.execute(
        'DELETE FROM User WHERE uid = ?',
        [uid]
      );

      // Commit both
      await connectionAuth.commit();
      await connectionMain.commit();

      return { success: true, message: 'User deleted successfully' };
    } catch (err) {
      // Rollback both if error
      await connectionAuth.rollback();
      await connectionMain.rollback();
      throw err;
    } finally {
      // Release connections
      connectionAuth.release();
      connectionMain.release();
    }
  }

  static async findUserByName(name) {
    try {
      const [rows] = await authPool.execute('SELECT * FROM User WHERE name = ?', [name]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findUserByName:', error);
      return null;
    }
  }

  static async findUserById(id) {
    try {
      const [rows] = await authPool.execute('SELECT * FROM User WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in findUserById:', error);
      return null;
    }
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(password, hash) {
    if (!hash) {
      console.error('Hash is undefined or null');
      return false;
    }
    
    try {
      console.log('Comparing password with hash');
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }

  static generateJWT(userId, role) {
    return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyJWT(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  static async storeToken(userId, token, platform) {
    const column = platform === 'client' ? 'clientToken' : 'employeeToken';
    await authPool.execute(
      `UPDATE User SET ${column} = ? WHERE id = ?`,
      [token, userId]
    );
  }

  static async validateToken(userId, token, platform) {
    const column = platform === 'client' ? 'clientToken' : 'employeeToken';
    const [rows] = await authPool.execute(
      `SELECT 1 FROM User WHERE id = ? AND ${column} = ?`,
      [userId, token]
    );
    return rows.length > 0;
  }

  static async clearToken(userId, platform) {
    const column = platform === 'client' ? 'clientToken' : 'employeeToken';
    await authPool.execute(
      `UPDATE User SET ${column} = NULL WHERE id = ?`,
      [userId]
    );
  }

  static async clearAllTokens(userId) {
    await authPool.execute(
      'UPDATE User SET employeeToken = NULL, clientToken = NULL WHERE id = ?',
      [userId]
    );
  }

  static async findUserByToken(token) {
    // Check both token columns
    const [rows] = await authPool.execute(
      'SELECT * FROM User WHERE employeeToken = ? OR clientToken = ?',
      [token, token]
    );
    return rows[0];
  }
}

// Initialize table on startup
User.createTable().catch(console.error);

module.exports = User;