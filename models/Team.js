const pool = require('../dbConfig/db'); // Your MySQL connection pool

const Team = {
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM teams');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM teams WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (team_name, manager, team_lead, team_member) => {
        const [result] = await pool.query(
            'INSERT INTO teams (team_name, manager, team_lead, team_member) VALUES (?, ?, ?, ?)',
            [team_name, manager, team_lead, team_member]
        );
        return { id: result.insertId, team_name, manager, team_lead, team_member };
    },

    update: async (id, team_name, manager, team_lead, team_member) => {
        const [result] = await pool.query(
            'UPDATE teams SET team_name = ?, manager = ?, team_lead = ?, team_member = ? WHERE id = ?',
            [team_name, manager, team_lead, team_member, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM teams WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Team;
