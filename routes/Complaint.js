const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/Complaint');
const authMiddleware = require('../middleware/authMiddleware');
// Create a new complaint
router.post('/', complaintController.createComplaint);

// Get all complaints
router.get('/', complaintController.getAllComplaints);

module.exports = router;