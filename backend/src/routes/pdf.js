const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractTextFromPDF, analyzeWithGroq } = require('../services/pdfService');
const os = require('os');

// Configure multer for regular file uploads (analysis pipeline)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for the raw text extraction endpoint (/upload)
// Store files temporarily in system's temp directory
const tmpStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Regular upload middleware (10MB limit)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Raw text extraction middleware (100MB limit)
const uploadLarge = multer({
  storage: tmpStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// PDF extraction endpoint
router.post('/extract', upload.single('pdf'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const filePath = req.file.path;
    console.log(`Processing PDF file: ${filePath}`);

    // Extract text from the PDF
    const extractedText = await extractTextFromPDF(filePath);
    
    // Analyze with Groq
    const analysisResults = await analyzeWithGroq(extractedText);

    // Clean up the uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file: ${err}`);
    });

    res.status(200).json(analysisResults);
  } catch (error) {
    console.error('PDF extraction error:', error);
    next(error);
  }
});

/**
 * Raw PDF text extraction endpoint
 * This endpoint accepts larger files (up to 100MB) and returns only the raw extracted text
 * without any LLM processing. Files are stored temporarily in the system's temp directory.
 */
router.post('/upload', uploadLarge.single('pdf'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No PDF file uploaded' 
      });
    }

    const filePath = req.file.path;
    console.log(`Processing PDF file for raw text extraction: ${filePath}`);

    // Extract text from the PDF without any further processing
    const extractedText = await extractTextFromPDF(filePath);
    
    // Get file metadata
    const fileStats = fs.statSync(filePath);
    const fileSizeInMB = (fileStats.size / (1024 * 1024)).toFixed(2);

    // Clean up the uploaded file immediately after processing
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting temporary file: ${err}`);
    });

    // Return the raw text and some metadata
    res.status(200).json({
      success: true,
      text: extractedText,
      metadata: {
        filename: req.file.originalname,
        size: fileSizeInMB + 'MB',
        type: req.file.mimetype,
        extractedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('PDF raw text extraction error:', error);
    
    // Send a more descriptive error response
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File is too large. Maximum file size is 100MB.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract text from PDF'
    });
  }
});

module.exports = router;