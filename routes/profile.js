const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');

// Get all profiles (protected route)
router.get('/', authMiddleware.authenticate, ProfileController.getAllProfiles);

// Get profile by UID (protected route)
router.get('/:uid', authMiddleware.authenticate, ProfileController.getProfile);

// Update profile (protected route)
router.put('/:uid', authMiddleware.authenticate, ProfileController.updateProfile);

// Delete profile (protected route)
router.delete('/:uid', authMiddleware.authenticate, ProfileController.deleteProfile);

// Update a specific work schedule entry
router.put('/:uid/work-schedule/:id', 
 authMiddleware.authenticate,
  ProfileController.updateWorkSchedule
);

// Delete a specific work schedule entry
router.delete('/:uid/work-schedule/:id', 
 authMiddleware.authenticate,
  ProfileController.deleteWorkSchedule
);

router.post('/work-schedule/:uid', authMiddleware.authenticate, ProfileController.createWorkSchedule);









module.exports = router;