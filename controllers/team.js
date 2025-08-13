const Team = require('../models/Team');

module.exports = {
    getAllTeams: async (req, res) => {
        try {
            const teams = await Team.getAll();
            res.json({ success: true, data: teams });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    getTeamById: async (req, res) => {
        try {
            const team = await Team.getById(req.params.id);
            if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
            res.json({ success: true, data: team });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    createTeam: async (req, res) => {
        try {
            const { team_name, manager, team_lead, team_member } = req.body;
            const newTeam = await Team.create(team_name, manager, team_lead, team_member);
            res.status(201).json({ success: true, data: newTeam });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    updateTeam: async (req, res) => {
        try {
            const { team_name, manager, team_lead, team_member } = req.body;
            const updated = await Team.update(req.params.id, team_name, manager, team_lead, team_member);
            if (!updated) return res.status(404).json({ success: false, message: 'Team not found' });
            res.json({ success: true, message: 'Team updated successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    deleteTeam: async (req, res) => {
        try {
            const deleted = await Team.delete(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, message: 'Team not found' });
            res.json({ success: true, message: 'Team deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};
