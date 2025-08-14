const db = require('../dbConfig/db');

const Project = {
    getAll: async () => {
        try {
            const [rows] = await db.query('SELECT * FROM projects');
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    create: async (data) => {
        const query = `
            INSERT INTO projects (
                urls, name, start_date, expected_end_date, status, priority, end_date, job_no, 
                assigned_team, clients, target_end_date, goals, description, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.urls,
            data.name,
            data.start_date,
            data.expected_end_date,
            data.status,
            data.priority,
            data.end_date,
            data.job_no,
            data.assigned_team,
            data.clients,
            data.target_end_date,
            data.goals,
            data.description,
            data.created_by
        ];

        try {
            const [result] = await db.query(query, values);
            return { id: result.insertId, ...data };
        } catch (error) {
            throw error;
        }
    },

    update: async (id, data) => {
        const query = `
            UPDATE projects SET 
                urls = ?, name = ?, start_date = ?, expected_end_date = ?, 
                status = ?, priority = ?, end_date = ?, job_no = ?, assigned_team = ?, clients = ?, 
                target_end_date = ?, goals = ?, description = ?, created_by = ?
            WHERE id = ?
        `;
        const values = [
            data.urls,
            data.name,
            data.start_date,
            data.expected_end_date,
            data.status,
            data.priority,
            data.end_date,
            data.job_no,
            data.assigned_team,
            data.clients,
            data.target_end_date,
            data.goals,
            data.description,
            data.created_by,
            id
        ];

        try {
            const [result] = await db.query(query, values);
            if (result.affectedRows === 0) {
                throw new Error('Project not found');
            }
            return { id, ...data };
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM projects WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                throw new Error('Project not found');
            }
            return { id };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Project;