const express = require("express");
const FilesController = require("../../controllers/ClientOps/filesController");
const authMiddleware = require('../../middleware/authMiddleware');
const router = express.Router();
router.post("/",authMiddleware.authenticate, FilesController.createFile);
router.put("/:id", FilesController.updateFile);
router.delete("/:id",authMiddleware.authenticate, FilesController.deleteFile);
router.get("/",authMiddleware.authenticate, FilesController.getAllFiles);
router.get("/project/:projectId",authMiddleware.authenticate, FilesController.getFilesByProjectId);

module.exports = router;
