const express = require('express');
const router = express.Router();
const manualEmailController = require('../controllers/manualEmailController');

// Manual email routes
router.post('/manual-email/send', manualEmailController.sendManualEmail);
router.get('/projects/:projectId/emails', manualEmailController.getProjectEmails);
router.get('/emails/:id', manualEmailController.getEmail);
router.get('/projects/:projectId/milestone/:milestoneIndex/emails', manualEmailController.getEmailsByProjectAndMilestone);
module.exports = router;