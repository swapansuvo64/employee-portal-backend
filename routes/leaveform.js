const express = require('express');
const router = express.Router();
const leaveFormController = require('../controllers/leaveform');
const authMiddleware = require('../middleware/authMiddleware');
// POST → Create leave form
router.post('/',authMiddleware.authenticate, leaveFormController.createLeaveForm);

// GET → Get all leave forms
router.get('/',authMiddleware.authenticate, leaveFormController.getAllLeaveForms);

module.exports = router;
