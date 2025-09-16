const express = require('express');
const router = express.Router();
const { FileUploadController } = require('../controllers/fileUploadController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upload',  

  (req, res, next) => {
    if (!req.is('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be multipart/form-data'
      });
    }
    next();
  },
  FileUploadController.uploadFiles
);

router.delete('/delete/:key', 
  authMiddleware.authenticate,
  FileUploadController.deleteFile
);

module.exports = router;