// controllers/project.js
const Project = require('../models/project');

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
            created_by: req.user.id // assuming you have user info in req.user
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