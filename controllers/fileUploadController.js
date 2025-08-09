const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configure multer for multiple S3 uploads
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
   // acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `uploads/${uniqueSuffix}-${file.originalname}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and DOC files are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file limit
    files: 5 // Maximum 5 files per upload
  }
}).array('files', 5); // Handle multiple files with field name 'files' and max 5 files

class FileUploadController {
  static async uploadFiles(req, res) {
    try {
      upload(req, res, async function (err) {
        if (err) {
          if (err instanceof multer.MulterError) {
            return res.status(400).json({
              success: false,
              message: err.message
            });
          }
          return res.status(500).json({
            success: false,
            message: err.message || 'File upload failed'
          });
        }

        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No files were uploaded'
          });
        }

        const uploadedFiles = req.files.map(file => ({
          url: file.location,
          key: file.key,
          mimetype: file.mimetype,
          size: file.size,
          originalname: file.originalname
        }));

        res.status(200).json({
          success: true,
          message: 'Files uploaded successfully',
          data: uploadedFiles
        });
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload files'
      });
    }
  }

  static async deleteFile(req, res) {
    try {
      const { key } = req.params;

      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'File key is required'
        });
      }

      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
      }));

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete file'
      });
    }
  }
}

module.exports = {
  FileUploadController,
  uploadMiddleware: upload
};