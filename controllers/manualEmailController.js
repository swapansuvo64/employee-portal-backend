const ManualEmail = require('../models/ManualEmail');
const Project = require('../models/project');
const sendEmail = require('../middleware/sendCompanyMail');

const manualEmailController = {
    // Send a manual email
    sendManualEmail: async (req, res) => {
        try {
            const { projectId, milestoneIndex, subject, htmlMessage, recipients, sentBy } = req.body;

            // Validate required fields
            if (!projectId || !subject || !htmlMessage || !recipients || !sentBy) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: projectId, subject, htmlMessage, recipients, sentBy'
                });
            }

            // Get project details
            const project = await Project.getById(projectId);
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            // Process the email content (replace placeholders)
            let processedHtml = htmlMessage;
            
            // Replace placeholders with actual values
            processedHtml = processedHtml
                .replace(/{ClientName}/g, project.client_name || project.client_Company_name || 'Valued Client')
                .replace(/{ProjectName}/g, project.name)
                .replace(/{JobNo}/g, project.job_no || 'N/A')
                .replace(/{Deadline}/g, project.target_end_date || project.expected_end_date || 'Not specified')
                .replace(/{Milestone}/g, project.milestones && project.milestones[milestoneIndex] 
                    ? project.milestones[milestoneIndex] 
                    : 'Current Milestone');

            // Send the email
            const emailOptions = {
                to: recipients,
                subject: subject,
                html: processedHtml
            };

            const emailResult = await sendEmail(emailOptions);

            if (!emailResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send email',
                    error: emailResult.error
                });
            }

            // Save the email record
            const emailRecord = await ManualEmail.create({
                projectId,
                milestoneIndex,
                subject,
                htmlMessage: processedHtml, // Save the processed version
                recipients,
                sentBy
            });

            res.json({
                success: true,
                message: 'Email sent successfully',
                data: {
                    emailId: emailRecord.id,
                    emailInfo: emailResult.info
                }
            });

        } catch (error) {
            console.error('Error sending manual email:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    },

    // Get all emails for a project
    getProjectEmails: async (req, res) => {
        try {
            const { projectId } = req.params;

            const emails = await ManualEmail.getByProjectId(projectId);

            res.json({
                success: true,
                data: emails
            });
        } catch (error) {
            console.error('Error fetching project emails:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    },

    // Get a specific email
    getEmail: async (req, res) => {
        try {
            const { id } = req.params;

            const email = await ManualEmail.getById(id);

            if (!email) {
                return res.status(404).json({
                    success: false,
                    message: 'Email not found'
                });
            }

            res.json({
                success: true,
                data: email
            });
        } catch (error) {
            console.error('Error fetching email:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    },
    getEmailsByProjectAndMilestone: async (req, res) => {
        try {
            const { projectId, milestoneIndex } = req.params;

            // Validate parameters
            if (!projectId || milestoneIndex === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Project ID and milestone index are required'
                });
            }

            const emails = await ManualEmail.getByProjectIdAndMilestone(projectId, parseInt(milestoneIndex));

            res.json({
                success: true,
                data: emails
            });
        } catch (error) {
            console.error('Error fetching emails by project and milestone:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    },
};

module.exports = manualEmailController;