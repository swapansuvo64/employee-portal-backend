const db = require('../dbConfig/db');

const ManualEmail = {
    // Get all sent emails for a project
    getByProjectId: async (projectId) => {
        try {
            const query = `
                SELECT me.*, p.username as sender_name, p.email as sender_email
                FROM manual_emails me
                LEFT JOIN profile p ON me.sent_by = p.uid
                WHERE me.project_id = ?
                ORDER BY me.sent_at DESC
            `;
            const [emails] = await db.query(query, [projectId]);
            return emails;
        } catch (error) {
            throw error;
        }
    },

    // Create a new email record
    create: async (data) => {
        try {
            const query = `
                INSERT INTO manual_emails 
                (project_id, milestone_index, subject, html_message, recipients, sent_by, sent_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            `;
            const values = [
                data.projectId,
                data.milestoneIndex,
                data.subject,
                data.htmlMessage,
                data.recipients,
                data.sentBy
            ];
            
            const [result] = await db.query(query, values);
            return { id: result.insertId, ...data };
        } catch (error) {
            throw error;
        }
    },

    // Get email by ID
    getById: async (id) => {
        try {
            const query = `
                SELECT me.*, p.username as sender_name, p.email as sender_email
                FROM manual_emails me
                LEFT JOIN profile p ON me.sent_by = p.uid
                WHERE me.id = ?
            `;
            const [emails] = await db.query(query, [id]);
            return emails.length > 0 ? emails[0] : null;
        } catch (error) {
            throw error;
        }
    },
    getByProjectIdAndMilestone: async (projectId, milestoneIndex) => {
        try {
            const query = `
                SELECT me.*, p.username as sender_name, p.email as sender_email
                FROM manual_emails me
                LEFT JOIN profile p ON me.sent_by = p.uid
                WHERE me.project_id = ? AND me.milestone_index = ?
                ORDER BY me.sent_at DESC
            `;
            const [emails] = await db.query(query, [projectId, milestoneIndex]);
            return emails;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = ManualEmail;