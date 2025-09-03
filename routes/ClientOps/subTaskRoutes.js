const express = require("express");
const router = express.Router();
const subTaskController = require("../../controllers/ClientOps/subTaskController");

// Get all subTasks
router.get("/", subTaskController.getAllSubTasks);

// Get subTask by ID
router.get("/:id", subTaskController.getSubTaskById);

// Get subTasks by Project ID
router.get("/project/:projectId", subTaskController.getSubTasksByProjectId);

// Create a new subTask
router.post("/", subTaskController.createSubTask);

// Update a subTask
router.put("/:id", subTaskController.updateSubTask);

// Delete a subTask
router.delete("/:id", subTaskController.deleteSubTask);

// Toggle completion status
router.patch("/:id/toggle-complete", subTaskController.toggleComplete);


router.patch("/swap-indexes", subTaskController.swapSubtaskIndexes);

// Reorder subtasks
router.patch("/reorder", subTaskController.reorderSubtasks);


router.patch("/:id/move-up", subTaskController.moveSubtaskUp);

// Move subtask down
router.patch("/:id/move-down", subTaskController.moveSubtaskDown);
module.exports = router;