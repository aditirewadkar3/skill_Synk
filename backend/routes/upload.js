import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * POST /api/upload/resume
 * Upload a PDF resume to Cloudinary
 */
router.post('/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Uploading resume to Cloudinary: ${req.file.originalname} (${req.file.size} bytes)`);

    // Convert buffer to base64 data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    // We use 'raw' as it's the safest for PDFs in terms of delivery restrictions
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'resumes',
      resource_type: 'raw',
      access_mode: 'public',
      use_filename: true,
      unique_filename: true
    });

    console.log('Cloudinary upload success (raw):', {
      public_id: result.public_id,
      url: result.secure_url,
      resource_type: result.resource_type
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary Resume upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload resume to Cloudinary', 
      message: error.message,
      details: error.details || 'Check backend logs'
    });
  }
});

export default router;
