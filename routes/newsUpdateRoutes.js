const express = require('express');
const router = express.Router();
const NewsUpdateController = require('../controllers/newsUpdateController');
const authMiddleware = require('../middleware/authMiddleware');

// Create news update (authenticated users only)
router.post('/', 
  authMiddleware.authenticate,
  NewsUpdateController.create
);

// Get all news updates (public)
router.get('/',authMiddleware.authenticate, NewsUpdateController.getAll);

// Get user's news updates (authenticated)
router.get('/my-news',
  authMiddleware.authenticate,
  NewsUpdateController.getByUser
);

// Update news update (authenticated + must be owner)
router.put('/:id',
  authMiddleware.authenticate,
  NewsUpdateController.update
);

// Delete news update (authenticated + must be owner)
router.delete('/:id',
  authMiddleware.authenticate,
  NewsUpdateController.delete
);

module.exports = router;