const ProjectModel = require('../../models/ClinetOps/ProjectModel');

class ProjectController {
  // Get all projects for cards display
 async getAllProjectsForCards(req, res) {
  try {
    const projects = await ProjectModel.getAllProjectsForCards();
    
    // Extract all cards from all projects and flatten into one array
    const allCards = projects.flatMap(project => project.cards);
    
    res.json({
      success: true,
      data: allCards,
      message: 'Projects cards retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting projects for cards:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

  // Get project by ID with full details
  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
      }

      const project = await ProjectModel.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      res.json({
        success: true,
        data: project,
        message: 'Project retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting project by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new ProjectController();