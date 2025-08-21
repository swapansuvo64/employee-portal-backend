const express = require("express");
const CommunicationLogController = require("../../controllers/ClientOps/communicationLogController");

const router = express.Router();

router.get("/", CommunicationLogController.getAll);
router.get("/:projectId", CommunicationLogController.getByProjectId);
router.post("/", CommunicationLogController.create);
router.put("/:id", CommunicationLogController.update);
router.delete("/:id", CommunicationLogController.delete);

module.exports = router;
