const db = require('../dbConfig/db');
const { compareMilestones } = require('../utils/milestoneUtils');
const sendEmail = require('../middleware/sendCompanyMail');
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
                    c.email AS client_email,
                    c.description AS client_description,
                    c.companyType AS client_company_type,
                    t.id AS team_id,
                    t.team_name,
                    t.manager AS team_manager_uid,
                    t.team_lead AS team_lead_uid,
                    t.team_member,
                    e.expectedDate AS Past_end_date
                FROM 
                    projects p
                LEFT JOIN 
                    clients c ON p.clients = c.id
                LEFT JOIN 
                    teams t ON p.assigned_team = t.id
                LEFT JOIN
                    expectedDate e ON p.id = e.projectId
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
                c.email AS client_email,
                c.description AS client_description,
                c.companyType AS client_company_type,
                t.id AS team_id,
                t.team_name,
                t.manager AS team_manager_uid,
                t.team_lead AS team_lead_uid,
                t.team_member,
                e.expectedDate AS Past_end_date
            FROM 
                projects p
            LEFT JOIN 
                clients c ON p.clients = c.id
            LEFT JOIN 
                teams t ON p.assigned_team = t.id
            LEFT JOIN
                    expectedDate e ON p.id = e.projectId
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
            milestones, milestones_status, isPrintProject
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            const newProject = { id: result.insertId, ...data };

            // Send project creation email (non-blocking)
            if (data.clients) {
                Project.sendProjectCreationEmail(
                    result.insertId,
                    data.clients,
                    data.name,
                    data.start_date,
                    data.expected_end_date || data.target_end_date
                ).catch(error => {
                    console.error('Failed to send project creation email:', error);
                });
            }
            await ExpectedDateLog.create({
                expectedDate: data.expected_end_date,
                projectId: result.insertId,
                createdBy: data.created_by
            });

            return newProject;
        } catch (error) {
            throw error;
        }
    },

    update: async (id, data) => {
        try {

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

            if (data.expected_end_date != ExpectedDate) {
                await ExpectedDateLog.update(
                    id, 
                    currentExpectedDate, 
                    data.created_by 
                );
            } else {
                console.log("error")
            }

            // First get the current project data to compare
            const currentProject = await Project.getById(id);

            const query = `
            UPDATE projects SET 
                urls = ?, name = ?, start_date = ?, expected_end_date = ?, 
                status = ?, priority = ?, end_date = ?, job_no = ?, assigned_team = ?, clients = ?, 
                target_end_date = ?, goals = ?, description = ?, created_by = ?,
                milestones = ?, milestones_status = ?, isPrintProject = ?,estimatedTime=?
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
                data.estimatedTime,
                id
            ];

            const [result] = await db.query(query, values);
            if (result.affectedRows === 0) {
                throw new Error('Project not found');
            }

            // Check for milestone progress
            if (currentProject && data.milestones && data.milestones_status) {
                const progressedMilestones = compareMilestones(
                    currentProject.milestones,
                    data.milestones,
                    currentProject.milestones_status,
                    data.milestones_status
                );

                if (progressedMilestones && progressedMilestones.length > 0) {
                    // Get client email
                    //const clientEmail = await Project.getClientEmail(data.clients || currentProject.clients);
                    const clientInfo = await Project.getClientEmail(data.clients || currentProject.clients);
                    if (clientInfo && clientInfo.email) {
                        // Send progress email (non-blocking)
                        // Project.sendProgressEmail(
                        //     id,
                        //     progressedMilestones,
                        //     // clientEmail,
                        //     clientInfo,
                        //     data.name || currentProject.name,
                        //     data.target_end_date || data.expected_end_date || currentProject.target_end_date || currentProject.expected_end_date
                        // ).catch(error => {
                        //     console.error('Failed to send progress email:', error);
                        //     // Don't throw error here as we don't want to fail the update
                        // });
                    }
                }
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
    },


    //-------------------------------------------------email------------------------------------------------------

    getClientEmail: async (clientId) => {
        try {
            const query = `
            SELECT email, client_name 
            FROM clients 
            WHERE id = ?
        `;
            const [results] = await db.query(query, [clientId]);
            return results.length > 0 ? {
                email: results[0].email,
                client_name: results[0].client_name
            } : null;
        } catch (error) {
            throw error;
        }
    },

terminate: async (id, htmlContent, updatedBy, withEmail) => {
    try {
        console.log('Model terminate called:', { id, withEmail, hasHtmlContent: !!htmlContent, updatedBy });
        
        // First get the current project data
        const [rows] = await db.query(
            "SELECT * FROM projects WHERE id = ?",
            [id]
        );
        console.log(htmlContent)
        if (rows.length === 0) {
            throw new Error("Project not found");
        }
        
        const project = rows[0];
        console.log('Project found:', { id: project.id, name: project.name, status: project.status });
        
        // Update project status to Terminate
        const query = "UPDATE projects SET status = 'Terminate', end_date = NOW(), created_by = ? WHERE id = ?";
        const [result] = await db.query(query, [updatedBy, id]);
        
        if (result.affectedRows === 0) {
            throw new Error('Failed to terminate project - no rows affected');
        }
        
        console.log('Project status updated successfully');
        
        // Only send email if withEmail is true and we have content
        if (withEmail) {
            if (!htmlContent || htmlContent.trim() === '') {
                console.warn('withEmail is true but no HTML content provided, skipping email');
            } else {
                try {
                    // Get client email
                    const clientInfo = await Project.getClientEmail(project.clients);
                    
                    if (clientInfo && clientInfo.email) {
                        console.log('Sending termination email to:', clientInfo.email);
                        
                        // Send termination email
                        const emailOptions = {
                            to: clientInfo.email,
                            subject: `Project Completed: ${project.name}`,
                            html: htmlContent
                        };
                        
                        await sendEmail(emailOptions);
                        console.log('Termination email sent successfully');
                    } else {
                        console.warn('Client email not found, skipping email send');
                    }
                } catch (emailError) {
                    console.error('Error sending termination email:', emailError);
                    // Don't throw here - project is already terminated
                    // Just log the error and continue
                }
            }
        } else {
            console.log('Email sending disabled (withEmail = false)');
        }
        
        return { 
            success: true, 
            message: withEmail ? 'Project terminated and email sent successfully' : 'Project terminated successfully',
            projectId: id,
            withEmail: withEmail
        };
    } catch (error) {
        console.error('Error in terminate method:', error);
        throw error;
    }
},

    sendProgressEmail: async (projectId, progressedMilestones, clientInfo, projectName, deadline) => {
        try {
            const milestone = progressedMilestones[0];

            // Format the date
            const formatDate = (dateString) => {
                if (!dateString) return 'Not specified';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            const formattedDeadline = formatDate(deadline);

            const emailContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        margin: 0; 
                        padding: 0; 
                        color: #000000; 
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        background-color: #ffffff; 
                    }
                    .header { 
                        background-color: #ffffff;
                        padding: 30px 20px; 
                        text-align: center; 
                    }
                    .logo {
                        max-width: 200px;
                        height: auto;
                    }
                    .content { 
                        padding: 30px 20px; 
                        background-color: #ffffff;
                    }
                    .progress-section {
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .deadline-section {
                        background-color: #ffffff; 
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .footer { 
                       background-color: #ffffff;
                        padding: 25px 20px; 
                        text-align: center; 
                        color: #ffffff;
                    }
                    h2 {
                        color: #ffffff;
                        margin: 0;
                        font-size: 24px;
                    }
                    h3 {
                        color: #000000;
                        margin: 0 0 15px 0;
                        font-size: 20px;
                    }
                    p {
                        margin: 10px 0;
                        color: #000000;
                    }
                    .bold {
                        font-weight: bold;
                    }
                    .milestone-name {
                        font-size: 18px;
                        font-weight: bold;
                        color: #000000;
                    }
                    .deadline-text {
                        font-size: 16px;
                        font-weight: bold;
                        color: #000000;
                    }
                    .signature {
                        color: #ffffff;
                        font-weight: normal;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header with logo -->
                    <div class="header">
                        <img src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png" alt="Sequoia Print Logo" class="logo">
                        <h2>Project Update</h2>
                    </div>

                    <!-- Main Content -->
                    <div class="content">
                        <p>Dear <span class="bold">${clientInfo.client_name}</span>,</p>
                        
                        <p>Sequoia Print is glad to be your partner as you bring your <span class="bold">${projectName}</span> to life.</p>

                        <!-- Progress Section -->
                        <div class="progress-section">
                            <h3> Project Progress Update</h3>
                            <p>Your project has now successfully progressed to:</p>
                            <p class="milestone-name">${milestone.milestone}</p>
                        </div>

                        <!-- Deadline Section -->
                        <div class="deadline-section">
                            <h3>Important Deadline</h3>
                            <p class="deadline-text">${formattedDeadline}</p>
                        </div>

                        <p>For any questions or support, please feel free to reach out to our team.</p>
                        
                        <p class="bold">We appreciate your trust in Sequoia Print!</p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p class="signature">Best regards,</p>
                        <p class="signature"><strong>Team Sequoia Print</strong></p>
                        <p class="signature" style="font-size: 12px; margin-top: 15px;">
                            Excellence in Printing Solutions
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

            const emailOptions = {
                to: clientInfo.email,
                subject: `Project Update: ${projectName} - Progress to ${milestone.milestone}`,
                html: emailContent
            };

            const result = await sendEmail(emailOptions);
            return result;
        } catch (error) {
            console.error('Error sending progress email:', error);
            throw error;
        }
    },



    sendProjectCreationEmail: async (projectId, clientId, projectName, startDate, endDate) => {
        try {
            const clientInfo = await Project.getClientEmail(clientId);

            if (!clientInfo || !clientInfo.email) {
                console.log('No client email found for project creation notification');
                return;
            }

            // Format dates
            const formatDate = (dateString) => {
                if (!dateString) return 'Not specified';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);

            const emailContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        margin: 0; 
                        padding: 0; 
                        color: #000000; 
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        background-color: #ffffff; 
                    }
                    .header { 
                        background-color: #ffffff;
                        padding: 30px 20px; 
                        text-align: center; 
                    }
                    .logo {
                        max-width: 200px;
                        height: auto;
                    }
                    .content { 
                        padding: 30px 20px; 
                        background-color: #ffffff;
                    }
                    .welcome-section {
                       background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .timeline-section {
                        background-color: #ffffff; 
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
                        border: 2px solid #ea7426;
                    }
                    .footer { 
                        background-color: #ffffff;
                        padding: 25px 20px; 
                        text-align: center; 
                        color: #ffffff;
                    }
                    h2 {
                        color: #000000;
                        margin: 0;
                        font-size: 24px;
                    }
                    h3 {
                        color: #000000;
                        margin: 0 0 15px 0;
                        font-size: 20px;
                    }
                    p {
                        margin: 10px 0;
                        color: #000000;
                    }
                    .bold {
                        font-weight: bold;
                    }
                    .project-name {
                        font-size: 22px;
                        font-weight: bold;
                        color: #000000;
                    }
                    .timeline-text {
                        font-size: 16px;
                        font-weight: bold;
                        color: #000000;
                    }
                    .signature {
                        color: #ffffff;
                        font-weight: normal;
                    }
                    .highlight {
                        color: #ea7426;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header with logo -->
                    <div class="header">
                        <img src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/sequiaPrintLogo.png" alt="Sequoia Print Logo" class="logo">
                        <h2>New Project Started</h2>
                    </div>

                    <!-- Main Content -->
                    <div class="content">
                        <p>Dear <span class="bold">${clientInfo.client_name}</span>,</p>
                        
                        <p>We are excited to announce that your new project has been successfully created!</p>

                        <!-- Welcome Section -->
                        <div class="welcome-section">
                            <h3>🎉 Welcome to Sequoia Print</h3>
                            <p>We're thrilled to partner with you on:</p>
                            <p class="project-name">${projectName}</p>
                        </div>

                        <!-- Timeline Section -->
                        <div class="timeline-section">
                            <h3>📅 Project Timeline</h3>
                            <p><span class="bold">Start Date:</span> <span class="timeline-text">${formattedStartDate}</span></p>
                            <p><span class="bold">Expected Completion:</span> <span class="timeline-text">${formattedEndDate}</span></p>
                        </div>

                        <p>Our team is already working on bringing your vision to life. We'll keep you updated at every milestone.</p>
                        
                        <p class="bold">Thank you for choosing <span class="highlight">Sequoia Print</span> for your printing needs!</p>

                        <p>For any questions or to discuss your project, please don't hesitate to contact us.</p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p class="signature">Best regards,</p>
                        <p class="signature"><strong>Team Sequoia Print</strong></p>
                        <p class="signature" style="font-size: 12px; margin-top: 15px;">
                            Excellence in Printing Solutions
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

            const emailOptions = {
                to: clientInfo.email,
                subject: `🚀 New Project Started: ${projectName}`,
                html: emailContent
            };

            const result = await sendEmail(emailOptions);
            console.log('Project creation email sent successfully');
            return result;
        } catch (error) {
            console.error('Error sending project creation email:', error);
            throw error;
        }
    }

};

module.exports = Project;