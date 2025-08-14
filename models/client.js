const db = require('../dbConfig/db');

const Client = {
    getAll: async () => {
        const [results] = await db.query('SELECT * FROM clients');
        return results;
    },

    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
        return results[0];
    },

    create: async (data) => {
        const [result] = await db.query(
            `INSERT INTO clients (client_name, name, phone, email, companyType, description, urls, createdBy) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.client_name,
                data.name,
                data.phone,
                data.email,
                data.companyType,
                data.description,
                data.urls,
                data.createdBy
            ]
        );
        return result;
    },

    update: async (id, data) => {
        await db.query(
            `UPDATE clients 
             SET client_name=?, name=?, phone=?, email=?, companyType=?, description=?, urls=?, createdBy=? 
             WHERE id=?`,
            [
                data.client_name,
                data.name,
                data.phone,
                data.email,
                data.companyType,
                data.description,
                data.urls,
                data.createdBy,
                id
            ]
        );
    },

    delete: async (id) => {
        await db.query('DELETE FROM clients WHERE id = ?', [id]);
    }
};

module.exports = Client;