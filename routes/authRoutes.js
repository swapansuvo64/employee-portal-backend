const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/signup',authMiddleware.authenticate, authController.signup);
router.post('/login', authController.login);

// Protected routes
router.post('/logout', authMiddleware.authenticate, authController.logout);
router.get('/profile', authMiddleware.authenticate, authController.getProfile);
router.delete('/:uid',authMiddleware.authenticate, authController.deleteUser);
// Admin-only route example
router.get('/admin', 
  authMiddleware.authenticate, 
  authMiddleware.authorize(['admin']), 
  (req, res) => {
    res.json({ 
      success: true,
      message: 'Welcome admin!' 
    });
  }
);

module.exports = router;