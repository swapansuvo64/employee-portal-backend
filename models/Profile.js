const pool = require('../dbConfig/db');

class Profile {
  static async getByUid(uid) {
    try {
      console.log('Executing getByUid query for UID:', uid);
      
      // Add validation for uid parameter
      if (!uid) {
        throw new Error('UID parameter is required');
      }
      
      // Check if pool is properly initialized
      if (!pool) {
        throw new Error('Database pool is not initialized');
      }
      
      const query = `
        SELECT p.*,ws.id, ws.days, ws.start_day_name, ws.end_day_name, ws.start_time, ws.end_time
        FROM profile p
        LEFT JOIN work_schedule ws ON p.uid = ws.uid
        WHERE p.uid = ?
      `;
      
      // Ensure parameters array is properly formed
      const params = [uid];
      console.log('Query parameters:', params);
      
      const [rows] = await pool.query(query, params);
      
      console.log('Query executed successfully. Rows found:', rows ? rows.length : 0);

      if (!rows || rows.length === 0) {
        console.log('No profile found for UID:', uid);
        return null;
      }
      
      const profileData = {
        ...rows[0],
        work_schedule: rows.filter(row => row.days !== null).map(row => ({
          id: row.id,
          days: row.days,
          start_day_name: row.start_day_name,
          end_day_name: row.end_day_name,
          start_time: row.start_time,
          end_time: row.end_time
        }))
      };
      
      delete profileData.id; 
      delete profileData.days;
      delete profileData.start_day_name;
      delete profileData.end_day_name;
      delete profileData.start_time;
      delete profileData.end_time;
      
      return profileData;
    } catch (error) {
      console.error('Error in getByUid method:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        stack: error.stack
      });
      throw error;
    }
  }

  static async getAll() {
    try {
      console.log('Executing getAll query...');
      
      // Check if pool is properly initialized
      if (!pool) {
        throw new Error('Database pool is not initialized');
      }
      
      const [rows] = await pool.query(`
        SELECT 
          p.*, 
          ws.id AS ws_id, 
          ws.days, 
          ws.start_day_name, 
          ws.end_day_name, 
          ws.start_time, 
          ws.end_time
        FROM profile p
        LEFT JOIN work_schedule ws ON p.uid = ws.uid
        ORDER BY p.uid
      `);

      console.log('Query executed successfully. Rows found:', rows ? rows.length : 0);

      if (!rows || rows.length === 0) {
        console.log('No profiles found in database');
        return [];
      }

      const profilesMap = new Map();

      for (const row of rows) {
        if (!row.uid) {
          console.warn('Row missing uid:', row);
          continue;
        }

        if (!profilesMap.has(row.uid)) {
          profilesMap.set(row.uid, {
            uid: row.uid,
            firstname: row.firstname,
            lastname: row.lastname,
            email: row.email,
            department: row.department,
            designation: row.designation,
            username: row.username,
            role: row.role,
            status: row.status,
            profilepicurl: row.profilepicurl,
            joindate: row.joindate,
            location: row.location,
            manager: row.manager,
            phonno: row.phonno,
            bio: row.bio,
            updated_at: row.updated_at,
            work_schedules: []
          });
        }

        if (row.ws_id) {
          profilesMap.get(row.uid).work_schedules.push({
            id: row.ws_id,
            days: row.days,
            start_day_name: row.start_day_name,
            end_day_name: row.end_day_name,
            start_time: row.start_time,
            end_time: row.end_time
          });
        }
      }

      const profiles = Array.from(profilesMap.values());
      console.log('Processed profiles:', profiles.length);
      return profiles;

    } catch (error) {
      console.error('Error in getAll method:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        stack: error.stack
      });
      throw error;
    }
  }

  static async update(uid, updateData) {
    let connection;
    
    try {
      // Validate inputs
      if (!uid) {
        throw new Error('UID parameter is required');
      }
      
      if (!updateData || typeof updateData !== 'object') {
        throw new Error('Update data is required and must be an object');
      }
      
      if (!pool) {
        throw new Error('Database pool is not initialized');
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      console.log('Updating profile for UID:', uid);
      
      const profileSetClauses = [];
      const profileValues = [];
      
      const profileFields = [
        'firstname', 'lastname', 'profilepicurl', 'role', 'designation',
        'email', 'phonno', 'location', 'department', 'bio', 'joindate', 'manager'
      ];
      
      profileFields.forEach(field => {
        if (updateData[field] !== undefined) {
          profileSetClauses.push(`${field} = ?`);
          profileValues.push(updateData[field]);
        }
      });

      if (profileSetClauses.length > 0) {
        profileSetClauses.push('updated_at = CURRENT_TIMESTAMP');
        const profileQuery = `
          UPDATE profile 
          SET ${profileSetClauses.join(', ')}
          WHERE uid = ?
        `;
        profileValues.push(uid);
        await connection.query(profileQuery, profileValues);
      }

      if (updateData.work_schedule && Array.isArray(updateData.work_schedule)) {
        console.log('Updating work schedule for UID:', uid);
        
        await connection.query('DELETE FROM work_schedule WHERE uid = ?', [uid]);
        
        for (const schedule of updateData.work_schedule) {
          await connection.query(
            `INSERT INTO work_schedule 
             (days, start_day_name, end_day_name, start_time, end_time, uid)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              schedule.days,
              schedule.start_day_name,
              schedule.end_day_name,
              schedule.start_time,
              schedule.end_time,
              uid
            ]
          );
        }
      }

      await connection.commit();
      console.log('Profile updated successfully for UID:', uid);
      
      return await this.getByUid(uid);
    } catch (error) {
      console.error('Error in update method:', error);
      if (connection) {
        await connection.rollback();
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async delete(uid) {
    let connection;
    
    try {
      // Validate input
      if (!uid) {
        throw new Error('UID parameter is required');
      }
      
      if (!pool) {
        throw new Error('Database pool is not initialized');
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      console.log('Deleting profile for UID:', uid);

      const existingProfile = await this.getByUid(uid);
      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      await connection.query('DELETE FROM work_schedule WHERE uid = ?', [uid]);
      await connection.query('DELETE FROM profile WHERE uid = ?', [uid]);
      
      await connection.commit();
      console.log('Profile deleted successfully for UID:', uid);
      return true;
    } catch (error) {
      console.error('Error in delete method:', error);
      if (connection) {
        await connection.rollback();
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  //-----------------------------------Schedule Management-----------------------------------

  static async updateWorkSchedule(id, uid, updateData) {
    let connection;
    
    try {
      // Validate inputs
      if (!id || !uid) {
        throw new Error('Both ID and UID parameters are required');
      }
      
      if (!updateData || typeof updateData !== 'object') {
        throw new Error('Update data is required and must be an object');
      }
      
      if (!pool) {
        throw new Error('Database pool is not initialized');
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      console.log('Updating work schedule. ID:', id, 'UID:', uid);

      const [existing] = await connection.query(
        'SELECT * FROM work_schedule WHERE id = ? AND uid = ?',
        [id, uid]
      );

      if (!existing || existing.length === 0) {
        throw new Error('Work schedule not found or unauthorized');
      }

      const setClauses = [];
      const values = [];
      
      const fields = [
        'days', 'start_day_name', 'end_day_name', 
        'start_time', 'end_time'
      ];
      
      fields.forEach(field => {
        if (updateData[field] !== undefined) {
          setClauses.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      });

      if (setClauses.length === 0) {
        throw new Error('No valid fields to update');
      }

      const query = `
        UPDATE work_schedule 
        SET ${setClauses.join(', ')}
        WHERE id = ? AND uid = ?
      `;
      
      values.push(id, uid);
      await connection.query(query, values);
      await connection.commit();

      console.log('Work schedule updated successfully');
      return await this.getWorkScheduleById(id, uid);
    } catch (error) {
      console.error('Error in updateWorkSchedule method:', error);
      if (connection) {
        await connection.rollback();
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async deleteWorkSchedule(id, uid) {
    let connection;
    
    try {
      // Validate inputs
      if (!id || !uid) {
        throw new Error('Both ID and UID parameters are required');
      }
      
      if (!pool) {
        throw new Error('Database pool is not initialized');
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      console.log('Deleting work schedule. ID:', id, 'UID:', uid);

      const [existing] = await connection.query(
        'SELECT * FROM work_schedule WHERE id = ? AND uid = ?',
        [id, uid]
      );

      if (!existing || existing.length === 0) {
        throw new Error('Work schedule not found or unauthorized');
      }

      await connection.query(
        'DELETE FROM work_schedule WHERE id = ? AND uid = ?',
        [id, uid]
      );
      
      await connection.commit();
      console.log('Work schedule deleted successfully');
      return { success: true, message: 'Work schedule deleted' };
    } catch (error) {
      console.error('Error in deleteWorkSchedule method:', error);
      if (connection) {
        await connection.rollback();
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  static async getWorkScheduleById(id, uid) {
    try {
      // Validate inputs
      if (!id || !uid) {
        throw new Error('Both ID and UID parameters are required');
      }
      
      if (!pool) {
        throw new Error('Database pool is not initialized');
      }
      
      console.log('Getting work schedule by ID:', id, 'UID:', uid);
      
      const [rows] = await pool.query(
        'SELECT * FROM work_schedule WHERE id = ? AND uid = ?',
        [id, uid]
      );
      
      console.log('Work schedule query result:', rows ? rows.length : 0);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in getWorkScheduleById method:', error);
      throw error;
    }
  }

  static async createWorkSchedule(uid, data) {
    let connection;
    
    try {
      // Validate inputs
      if (!uid) {
        throw new Error('UID parameter is required');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Schedule data is required and must be an object');
      }
      
      if (!pool) {
        throw new Error('Database pool is not initialized');
      }
      
      connection = await pool.getConnection();
      await connection.beginTransaction();

      console.log('Creating work schedule for UID:', uid);
      
      const { days, start_day_name, end_day_name, start_time, end_time } = data;

      const [result] = await connection.query(
        `INSERT INTO work_schedule (uid, days, start_day_name, end_day_name, start_time, end_time) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uid, days, start_day_name, end_day_name, start_time, end_time]
      );

      await connection.commit();
      console.log('Work schedule created successfully. Insert ID:', result.insertId);
      
      return await this.getWorkScheduleById(result.insertId, uid);
    } catch (error) {
      console.error('Error in createWorkSchedule method:', error);
      if (connection) {
        await connection.rollback();
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
}

module.exports = Profile;