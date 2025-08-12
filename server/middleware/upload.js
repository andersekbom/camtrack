const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Upload to uploads/cameras directory
    const uploadPath = path.join(__dirname, '../../uploads/cameras');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with UUID
    const extension = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${extension}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept only JPEG and PNG files
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Maximum 2 files
  }
});

// Middleware for handling camera image uploads
const uploadCameraImages = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]);

// Configure storage for default images
const defaultImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Upload to uploads/default-images directory
    const uploadPath = path.join(__dirname, '../../uploads/default-images');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with UUID
    const extension = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${extension}`;
    cb(null, uniqueName);
  }
});

// Configure multer for default images
const defaultImageUpload = multer({
  storage: defaultImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Maximum 1 file for default images
  }
});

// Middleware for handling single default image upload
const uploadDefaultImage = defaultImageUpload.single('defaultImage');

// Error handling middleware for multer errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 5MB per image.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files. Maximum 2 images allowed.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Unexpected field name. Use "image1" or "image2".' 
      });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error.message === 'Only JPEG and PNG files are allowed') {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
};

module.exports = {
  uploadCameraImages,
  uploadDefaultImage,
  handleUploadError
};