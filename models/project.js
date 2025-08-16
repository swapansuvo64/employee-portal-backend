const db = require('../dbConfig/db');

const Project = {
    getAll: async () => {
        try {
            // First get all projects with client and team info
            const projectQuery = `
                SELECT 
                    p.*,
                    c.id AS client_id,
                    c.name AS client_name,
                    c.client_name AS client_Company_name,
                    c.urls AS client_urls,
                    c.description AS client_description,
                    c.companyType AS client_company_type,
                    t.id AS team_id,
                    t.team_name,
                    t.manager AS team_manager_uid,
                    t.team_lead AS team_lead_uid,
                    t.team_member
                FROM 
                    projects p
                LEFT JOIN 
                    clients c ON p.clients = c.id
                LEFT JOIN 
                    teams t ON p.assigned_team = t.id
            `;

            const [projects] = await db.query(projectQuery);

            // Then get all team members, managers, and leads for each project
            const projectsWithMembers = await Promise.all(projects.map(async (project) => {
                if (!project.assigned_team) {
                    return {
                        ...project,
                        team_members: [],
                        team_manager: null,
                        team_lead: null
                    };
                }

                // Collect all UIDs we need to fetch (manager, lead, and members)
                const uidsToFetch = [];
                
                if (project.team_manager_uid) {
                    uidsToFetch.push(project.team_manager_uid);
                }
                if (project.team_lead_uid) {
                    uidsToFetch.push(project.team_lead_uid);
                }
                if (project.team_member) {
                    uidsToFetch.push(...project.team_member.split(','));
                }

                // Remove duplicates
                const uniqueUids = [...new Set(uidsToFetch)];

                // Get all profiles at once
                const placeholders = uniqueUids.map(() => '?').join(',');
                const memberQuery = `
                    SELECT 
                        uid, username, firstname, lastname, profilepicurl,
                        role, designation, email, phonno, department
                    FROM 
                        profile
                    WHERE 
                        uid IN (${placeholders})
                `;

                const [profiles] = await db.query(memberQuery, uniqueUids);

                // Create a map for quick lookup
                const profileMap = profiles.reduce((map, profile) => {
                    map[profile.uid] = profile;
                    return map;
                }, {});

                // Extract members, manager, and lead
                const teamMembers = project.team_member 
                    ? project.team_member.split(',').map(uid => profileMap[uid]).filter(Boolean)
                    : [];

                const teamManager = project.team_manager_uid 
                    ? profileMap[project.team_manager_uid]
                    : null;

                const teamLead = project.team_lead_uid 
                    ? profileMap[project.team_lead_uid]
                    : null;

                return {
                    ...project,
                    team_members: teamMembers,
                    team_manager: teamManager,
                    team_lead: teamLead
                };
            }));

            return projectsWithMembers;
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
                assigned_team, clients, target_end_date, goals, description, created_by,
                milestones, milestones_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            data.milestones,
            data.milestones_status
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
                target_end_date = ?, goals = ?, description = ?, created_by = ?,
                milestones = ?, milestones_status = ?
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
            data.milestones,
            data.milestones_status,
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