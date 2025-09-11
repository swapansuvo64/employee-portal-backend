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
        const { htmlContent, updatedBy } = req.body;

        if (!id || !htmlContent || !updatedBy) {
            return res.status(400).json({
                success: false,
                message: 'Project ID, HTML content, and updated by user are required'
            });
        }

        // Use the static method directly (no need to instantiate)
        const result = await Project.terminate(id, htmlContent, updatedBy);
        
        res.status(200).json({
            success: true,
            message: 'Project terminated successfully',
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
