const pool = require('../dbConfig/db');

class Profile {
  static async getByUid(uid) {
    const query = `
      SELECT p.*,ws.id, ws.days, ws.start_day_name, ws.end_day_name, ws.start_time, ws.end_time
      FROM profile p
      LEFT JOIN work_schedule ws ON p.uid = ws.uid
      WHERE p.uid = ?
    `;
    const [rows] = await pool.execute(query, [uid]);
    
    if (!rows.length) return null;
    
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
  }

static async getAll() {
  const [rows] = await pool.execute(`
    SELECT p.*, ws.id AS ws_id, ws.days, ws.start_day_name, ws.end_day_name, ws.start_time, ws.end_time
    FROM profile p
    LEFT JOIN work_schedule ws ON p.uid = ws.uid
  `);

  const profilesMap = new Map();

  for (const row of rows) {
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

  return Array.from(profilesMap.values());
}


  static async update(uid, updateData) {
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
     
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
        await connection.execute(profileQuery, profileValues);
      }

     
      if (updateData.work_schedule && Array.isArray(updateData.work_schedule)) {
        
        await connection.execute('DELETE FROM work_schedule WHERE uid = ?', [uid]);
        
       
        for (const schedule of updateData.work_schedule) {
          await connection.execute(
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
     
      return await this.getByUid(uid);
    } catch (error) {
      
      await connection.rollback();
      throw error;
    } finally {
      
      connection.release();
    }
  }

  static async delete(uid) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
    
      await connection.execute('DELETE FROM work_schedule WHERE uid = ?', [uid]);
      
      await connection.execute('DELETE FROM profile WHERE uid = ?', [uid]);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

//-----------------------------------Schedule Management-----------------------------------

  static async updateWorkSchedule(id, uid, updateData) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
console.log(id,uid)
  try {
    // Verify the schedule exists and belongs to the user
    const [existing] = await connection.execute(
      'SELECT * FROM work_schedule WHERE id = ? AND uid = ?',
      [id, uid]
    );

    if (!existing.length) {
      throw new Error('Work schedule not found or unauthorized');
    }

    // Build update query
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
    await connection.execute(query, values);
    await connection.commit();

    return await this.getWorkScheduleById(id, uid);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

static async deleteWorkSchedule(id, uid) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Verify existence first
    const [existing] = await connection.execute(
      'SELECT * FROM work_schedule WHERE id = ? AND uid = ?',
      [id, uid]
    );

    if (!existing.length) {
      throw new Error('Work schedule not found or unauthorized');
    }

    await connection.execute(
      'DELETE FROM work_schedule WHERE id = ? AND uid = ?',
      [id, uid]
    );
    
    await connection.commit();
    return { success: true, message: 'Work schedule deleted' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

static async getWorkScheduleById(id, uid) {
  const [rows] = await pool.execute(
    'SELECT * FROM work_schedule WHERE id = ? AND uid = ?',
    [id, uid]
  );
  return rows[0] || null;
}

 static async createWorkSchedule(uid, data) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const { days, start_day_name, end_day_name, start_time, end_time } = data;

      const [result] = await connection.execute(
        `INSERT INTO work_schedule (uid, days, start_day_name, end_day_name, start_time, end_time) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uid, days, start_day_name, end_day_name, start_time, end_time]
      );

      await connection.commit();
      return await this.getWorkScheduleById(result.insertId, uid);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}


module.exports = Profile;