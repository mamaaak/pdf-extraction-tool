/**
 * Routes for agricultural/environmental document data extraction
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { extractTextFromPDF, analyzeWithGroq } = require('../services/pdfService');
const { extractDocumentData, DocumentTypes, fillMissingValues } = require('../services/documentExtractor');

// Configure multer for document file uploads
const tmpStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: tmpStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

/**
 * Extract structured data from an agricultural/environmental document PDF
 * POST /api/documents/extract
 */
router.post('/extract', upload.single('pdf'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No PDF file uploaded' 
      });
    }

    const filePath = req.file.path;
    console.log(`Processing document PDF: ${filePath}`);

    // Get additional options from request
    const options = {
      documentType: req.body.documentType || null,
      includeRawText: req.body.includeRawText === 'true' || false
    };
    
    // Extract text from PDF
    const rawText = await extractTextFromPDF(filePath);
    
    // Extract structured data
    const extractedData = await extractDocumentData(rawText, options);

    // Also run a lightweight LLM analysis to get narrative summary/topics/dates
    let llmAnalysis = null;
    try {
      llmAnalysis = await analyzeWithGroq(rawText);
    } catch (e) {
      console.warn('LLM analysis for summary failed, continuing without it');
    }

    // Clean up the uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting temporary file: ${err}`);
    });

    // Fill in missing values in the extracted data
    extractedData.data = fillMissingValues(extractedData.data);
    
    // Check confidence level
    if (extractedData.confidence < 75) {
      return res.status(200).json({
        success: true,
        warning: 'Low confidence extraction (below 75%)',
        confidence: extractedData.confidence,
        documentType: extractedData.documentType,
        data: extractedData.data,
        metadata: {
          ...extractedData.metadata,
          filename: req.file.originalname,
          size: `${(req.file.size / (1024 * 1024)).toFixed(2)}MB`,
          extractedAt: new Date().toISOString()
        },
        validation: extractedData.validation,
        text: rawText // Include the raw extracted text
      });
    }

    // Return the structured data with raw text and LLM summary fields for UI
    res.status(200).json({
      success: true,
      confidence: extractedData.confidence,
      documentType: extractedData.documentType,
      data: extractedData.data,
      metadata: {
        ...extractedData.metadata,
        filename: req.file.originalname,
        size: `${(req.file.size / (1024 * 1024)).toFixed(2)}MB`,
        extractedAt: new Date().toISOString()
      },
      text: rawText, // Include the raw extracted text
      // Harmonize with frontend ResultsDisplay expectations
      findings: llmAnalysis?.findings || null,
      mainTopics: llmAnalysis?.mainTopics || [],
      importantDates: llmAnalysis?.importantDates || [],
      keyEntities: llmAnalysis?.keyEntities || {}
    });
  } catch (error) {
    console.error('Document extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract document data'
    });
  }
});

/**
 * Process raw text directly
 * POST /api/documents/process-text
 */
router.post('/process-text', express.json({ limit: '10mb' }), async (req, res, next) => {
  try {
    const { text, documentType, includeRawText } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No text provided for extraction'
      });
    }
    
    // Extract structured data
    const options = {
      documentType: documentType || null,
      includeRawText: includeRawText || false
    };
    
    const extractedData = await extractDocumentData(text, options);

    // Also try to get an LLM summary
    let llmAnalysis = null;
    try {
      llmAnalysis = await analyzeWithGroq(text);
    } catch {}
    
    // Fill in missing values in the extracted data
    extractedData.data = fillMissingValues(extractedData.data);
    
    // Check confidence level
    if (extractedData.confidence < 75) {
      return res.status(200).json({
        success: true,
        warning: 'Low confidence extraction (below 75%)',
        confidence: extractedData.confidence,
        documentType: extractedData.documentType,
        data: extractedData.data,
        metadata: extractedData.metadata,
        validation: extractedData.validation,
        text: text // Include the original text
      });
    }
    
    // Return the structured data with original text and LLM summary fields
    res.status(200).json({
      success: true,
      confidence: extractedData.confidence,
      documentType: extractedData.documentType,
      data: extractedData.data,
      metadata: extractedData.metadata,
      text: text,
      findings: llmAnalysis?.findings || null,
      mainTopics: llmAnalysis?.mainTopics || [],
      importantDates: llmAnalysis?.importantDates || [],
      keyEntities: llmAnalysis?.keyEntities || {}
    });
  } catch (error) {
    console.error('Document text processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process document text'
    });
  }
});

/**
 * Get supported document types
 * GET /api/documents/types
 */
router.get('/types', (req, res) => {
  res.status(200).json({
    success: true,
    types: Object.values(DocumentTypes).map(type => ({
      id: type,
      name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }))
  });
});

module.exports = router;