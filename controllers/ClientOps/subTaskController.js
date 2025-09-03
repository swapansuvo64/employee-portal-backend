const SubTask = require("../../models/ClinetOps/subTask");

const subTaskController = {
  // Get all subTasks
  getAllSubTasks: async (req, res) => {
    try {
      const subTasks = await SubTask.findAll();
      res.json({ success: true, data: subTasks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get subTask by ID
  getSubTaskById: async (req, res) => {
    try {
      const subTask = await SubTask.findById(req.params.id);
      if (!subTask) {
        return res.status(404).json({ success: false, message: "SubTask not found" });
      }
      res.json({ success: true, data: subTask });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get subTasks by Project ID
  getSubTasksByProjectId: async (req, res) => {
    try {
      const subTasks = await SubTask.findByProjectId(req.params.projectId);
      res.json({ success: true, data: subTasks });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Create a new subTask
  createSubTask: async (req, res) => {
    try {
      const { ProjectId, projectstageIndex, Task,subtaskIndex, createdBy, IsCompleted } = req.body;
      console.log(req.body);
      
      if (!ProjectId || projectstageIndex === undefined || projectstageIndex === null || !Task  || !createdBy) {
  return res.status(400).json({ 
    success: false, 
    message: "ProjectId, projectstageIndex, Task, and createdBy are required" 
  });
}

      const newSubTask = await SubTask.create({
        ProjectId,
        projectstageIndex,
        Task,
        subtaskIndex,
        createdBy,
        IsCompleted
      });
      
      res.status(201).json({ success: true, data: newSubTask });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update a subTask
  updateSubTask: async (req, res) => {
    try {
      const { ProjectId, projectstageIndex, Task, createdBy, IsCompleted } = req.body;
      
      if (!ProjectId || !projectstageIndex || !Task || !createdBy) {
        return res.status(400).json({ 
          success: false, 
          message: "ProjectId, projectstageIndex, Task, and createdBy are required" 
        });
      }

      const updatedSubTask = await SubTask.update(req.params.id, {
        ProjectId,
        projectstageIndex,
        Task,
        createdBy,
        IsCompleted
      });
      
      res.json({ success: true, data: updatedSubTask });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete a subTask
  deleteSubTask: async (req, res) => {
    try {
      const subTask = await SubTask.findById(req.params.id);
      if (!subTask) {
        return res.status(404).json({ success: false, message: "SubTask not found" });
      }

      await SubTask.delete(req.params.id);
      res.json({ success: true, message: "SubTask deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Toggle completion status
  toggleComplete: async (req, res) => {
    try {
      const subTask = await SubTask.findById(req.params.id);
      if (!subTask) {
        return res.status(404).json({ success: false, message: "SubTask not found" });
      }

      const success = await SubTask.toggleComplete(req.params.id);
      res.json({ success, message: "SubTask completion status toggled" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  //-.-----------------------
    swapSubtaskIndexes: async (req, res) => {
    try {
      const { id1, id2 } = req.body;
      
      if (!id1 || !id2) {
        return res.status(400).json({ 
          success: false, 
          message: "Both task IDs are required" 
        });
      }

      const success = await SubTask.swapSubtaskIndexes(id1, id2);
      res.json({ success, message: "Subtask indexes swapped successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Reorder subtasks
  reorderSubtasks: async (req, res) => {
    try {
      const { projectId, stageIndex, newOrder } = req.body;
      
      if (!projectId || stageIndex === undefined || !newOrder) {
        return res.status(400).json({ 
          success: false, 
          message: "Project ID, stage index, and new order are required" 
        });
      }

      const success = await SubTask.reorderSubtasks(projectId, stageIndex, newOrder);
      res.json({ success, message: "Subtasks reordered successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
    moveSubtaskUp: async (req, res) => {
    try {
      const { id } = req.params;
      const { projectId, stageIndex } = req.body;
      
      if (!projectId || stageIndex === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: "Project ID and stage index are required" 
        });
      }

      const success = await SubTask.moveSubtaskUp(id, projectId, stageIndex);
      res.json({ success, message: success ? "Subtask moved up" : "Subtask already at top" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Move subtask down
  moveSubtaskDown: async (req, res) => {
    try {
      const { id } = req.params;
      const { projectId, stageIndex } = req.body;
      
      if (!projectId || stageIndex === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: "Project ID and stage index are required" 
        });
      }

      const success = await SubTask.moveSubtaskDown(id, projectId, stageIndex);
      res.json({ success, message: success ? "Subtask moved down" : "Subtask already at bottom" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = subTaskController;