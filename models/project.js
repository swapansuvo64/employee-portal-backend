const db = require('../dbConfig/db');
const ExpectedDateLog = require("./ClinetOps/expectedDateLog")

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
            WHERE 
                p.id = ?
        `;

            const [projects] = await db.query(projectQuery, [id]);

            if (projects.length === 0) {
                return null; // No project found
            }

            const project = projects[0];

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

            const uniqueUids = [...new Set(uidsToFetch)];

            let profiles = [];
            if (uniqueUids.length > 0) {
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

                const [profileRows] = await db.query(memberQuery, uniqueUids);
                profiles = profileRows;
            }

            const profileMap = profiles.reduce((map, profile) => {
                map[profile.uid] = profile;
                return map;
            }, {});

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
        } catch (error) {
            throw error;
        }
    },


    create: async (data) => {
        const query = `
            INSERT INTO projects (
                urls, name, start_date, expected_end_date, status, priority, end_date, job_no, 
                assigned_team, clients, target_end_date, goals, description, created_by,
                milestones, milestones_status,isPrintProject
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
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
            data.isPrintProject
        ];

        try {
            const [result] = await db.query(query, values);


            await ExpectedDateLog.create({
                expectedDate: data.expected_end_date,
                projectId: result.insertId,
                createdBy: data.created_by
            });

            return { id: result.insertId, ...data };
        } catch (error) {
            throw error;
        }
    },

    update: async (id, data) => {


        const [rows] = await db.query(
            "SELECT expected_end_date FROM projects WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            throw new Error("Project not found");
        }

        const currentExpectedDate = rows[0].expected_end_date;
        const [expectedRows] = await db.query(
            "SELECT expectedDate FROM expectedDate WHERE projectId =?",
            [id]
        );
        if (expectedRows.length === 0) {
            throw new Error("Project not found");
        }
        ExpectedDate = expectedRows[0].expectedDate;

        if ( data.expected_end_date != ExpectedDate) {
            await ExpectedDateLog.update({
                projectId: id,
                expectedDate: currentExpectedDate,
                createdBy: data.created_by,
            });
        }


        const query = `
            UPDATE projects SET 
                urls = ?, name = ?, start_date = ?, expected_end_date = ?, 
                status = ?, priority = ?, end_date = ?, job_no = ?, assigned_team = ?, clients = ?, 
                target_end_date = ?, goals = ?, description = ?, created_by = ?,
                milestones = ?, milestones_status = ?,isPrintProject=?
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
            data.isPrintProject,
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