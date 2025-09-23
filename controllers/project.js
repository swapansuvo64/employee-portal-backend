// controllers/project.js
const Project = require('../models/project');
const db = require('../dbConfig/db');
exports.getAllProjects = async (req, res, next) => {
    try {
        const projects = await Project.getAll();
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

exports.getProjectById = async (req, res, next) => {
    try {
        const project = await Project.getById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

exports.createProject = async (req, res, next) => {
    try {
        const newProject = await Project.create({
            ...req.body,
            created_by: req.user.id // assuming you have user info in req.user
        });
        res.status(201).json(newProject);
    } catch (error) {
        next(error);
    }
};

exports.updateProject = async (req, res, next) => {
    try {
        const updatedProject = await Project.update(req.params.id, {
            ...req.body,
            created_by: req.user.id 
        });
        res.status(200).json(updatedProject);
    } catch (error) {
        next(error);
    }
};

exports.deleteProject = async (req, res, next) => {
    try {
        await Project.delete(req.params.id);
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        next(error);
    }
};

exports.terminateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { htmlContent, updatedBy, withEmail } = req.body;
        
        console.log('Terminate request:', { id, withEmail, hasHtmlContent: !!htmlContent, updatedBy });
        
        // Validate required fields
        if (!id || !updatedBy || withEmail === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Project ID, updated by user, and withEmail flag are required'
            });
        }

        // If withEmail is true, validate that we have HTML content
        if (withEmail && (!htmlContent || htmlContent.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: 'HTML content is required when sending email'
            });
        }
        
        // Use the static method directly
        const result = await Project.terminate(id, htmlContent || '', updatedBy, withEmail);
        
        res.status(200).json({
            success: true,
            message: withEmail ? 'Project terminated and email sent successfully' : 'Project terminated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error terminating project:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};
