const techProject = require('../models/techProjectModel')
module.exports = {
    getAllTechProjects: async (req, res) => {
        try {
            const Projects = await techProject.getAll();
            res.json({ success: true, data: Projects });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    getAllTechProjectsById: async (req, res) => {
        try {
            const project = await techProject.getById(req.params.id);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            res.json({ success: true, data: project });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    createTechProject : async (req, res)=>{
        try{
            const {team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status}=req.body;
            const newProject = await techProject.create(team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status);
            res.status(201).json({ success: true, data: newProject });
        } catch(err){
            res.status(500).json({ success: false, message: err.message });
        }
    },
    updateTechProject : async(req,res) =>{
        try{
            const {team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status}=req.body;
            const updated = await techProject.update(req.params.id,team_id,project_name,github_links,description,techstacks,media,start_date,end_date,status);
            if (!updated) return res.status(404).json({ success: false, message: 'Project not found' });
            res.json({ success: true, message: 'Project updated successfully' });
        } catch(err){
            res.status(500).json({ success: false, message: err.message });
        }
    },
    deleteTechProject : async(req,res) =>{
        try{
            const deleted = await techProject.delete(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, message: 'Project not found' });
            res.json({ success: true, message: 'Project deleted successfully' });
        } catch(err){
            res.status(500).json({ success: false, message: err.message });
        }
    }
}