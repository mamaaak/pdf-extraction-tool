/**
 * Routes for serving and exporting extracted report data
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

// In-memory cache of processed reports (in a production app, this would use a database)
let reportCache = {};

// Expose the cache for other routes to access
router.reportCache = reportCache;

/**
 * Store a report in the cache
 * @param {string} reportId - Unique report identifier
 * @param {Object} reportData - Extracted report data
 * @returns {string} Report ID
 */
function storeReport(reportId, reportData) {
  // Generate a unique ID if not provided
  const id = reportId || `report-${Date.now()}-${Math.round(Math.random() * 10000)}`;
  
  // Store report with timestamp
  reportCache[id] = {
    id,
    data: reportData,
    timestamp: new Date().toISOString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // Reports expire after 24 hours
  };
  
  // Clean up old reports
  cleanupExpiredReports();
  
  return id;
}

/**
 * Clean up expired reports from the cache
 */
function cleanupExpiredReports() {
  const now = new Date();
  Object.keys(reportCache).forEach(id => {
    if (new Date(reportCache[id].expires) < now) {
      delete reportCache[id];
    }
  });
}

/**
 * Get all available reports
 * GET /api/report
 */
router.get('/', (req, res) => {
  try {
    // Clean up expired reports first
    cleanupExpiredReports();
    
    // Return list of available reports (without the full data)
    const reports = Object.values(reportCache).map(({ id, timestamp, expires, data }) => ({
      id,
      timestamp,
      expires,
      documentType: data.documentType || data.metadata?.documentType || 'unknown',
      title: data.metadata?.title || 'Untitled Report'
    }));
    
    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve reports'
    });
  }
});

/**
 * Get a specific report by ID
 * GET /api/report/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if report exists
    if (!reportCache[id]) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.status(200).json({
      success: true,
      report: reportCache[id]
    });
  } catch (error) {
    console.error(`Error fetching report ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve report'
    });
  }
});

/**
 * Store report data (from document extraction)
 * POST /api/report
 */
router.post('/', express.json({ limit: '10mb' }), (req, res) => {
  try {
    const { reportData, reportId } = req.body;
    
    if (!reportData) {
      return res.status(400).json({
        success: false,
        error: 'No report data provided'
      });
    }
    
    // Store the report data
    const id = storeReport(reportId, reportData);
    
    res.status(201).json({
      success: true,
      id,
      message: 'Report stored successfully'
    });
  } catch (error) {
    console.error('Error storing report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store report'
    });
  }
});

/**
 * Delete a report
 * DELETE /api/report/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if report exists
    if (!reportCache[id]) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    // Delete the report
    delete reportCache[id];
    
    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting report ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete report'
    });
  }
});



module.exports = { 
  router,
  storeReport
};