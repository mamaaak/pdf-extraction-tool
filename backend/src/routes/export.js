/**
 * Routes for exporting report data
 */
const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const path = require('path');
const fs = require('fs');

/**
 * Export report data from document extractor
 * GET /api/export/:id?format=json|csv
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const format = req.query.format?.toLowerCase() || 'json';
    
    // Since we're using in-memory storage, access the cache from the reports router
    const { router: reportRouter } = require('./reports');
    
    // This is a workaround for accessing the in-memory cache
    // In a real application, you would use a proper database
    if (!reportRouter.reportCache || !reportRouter.reportCache[id]) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    const report = reportRouter.reportCache[id].data;
    
    if (format === 'csv') {
      // Flatten the report data for CSV export
      const flattenedData = flattenReportData(report);
      
      try {
        // Convert to CSV
        const parser = new Parser();
        const csv = parser.parse(flattenedData);
        
        // Set response headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="report-${id}.csv"`);
        
        return res.status(200).send(csv);
      } catch (csvError) {
        console.error('Error converting to CSV:', csvError);
        return res.status(500).json({
          success: false,
          error: 'Failed to convert report to CSV'
        });
      }
    } else {
      // Set response headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="report-${id}.json"`);
      
      return res.status(200).json(report);
    }
  } catch (error) {
    console.error(`Error exporting report ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to export report'
    });
  }
});

/**
 * Flatten nested report data for CSV export
 * @param {Object} report - Report data
 * @returns {Array<Object>} Flattened data array
 */
function flattenReportData(report) {
  const flattened = [];
  
  // Process different sections based on document type
  // This is a simple implementation - production code would need more robust handling
  
  // Process data based on its structure
  const data = report.data || report;
  
  // Handle watershed reports
  if (data.goals && Array.isArray(data.goals)) {
    data.goals.forEach(goal => {
      flattened.push({
        type: 'Goal',
        id: goal.id || '',
        description: goal.description || '',
        targetDate: goal.targetDate || '',
        status: goal.status || '',
        relatedBMPs: Array.isArray(goal.relatedBMPs) ? goal.relatedBMPs.join(', ') : ''
      });
    });
  }
  
  if (data.bmps && Array.isArray(data.bmps)) {
    data.bmps.forEach(bmp => {
      flattened.push({
        type: 'BMP',
        id: bmp.id || '',
        name: bmp.name || '',
        description: bmp.description || '',
        category: bmp.category || '',
        cost: bmp.cost || '',
        timeframe: bmp.timeframe || '',
        priority: bmp.priority || ''
      });
    });
  }
  
  if (data.implementation && Array.isArray(data.implementation)) {
    data.implementation.forEach(item => {
      flattened.push({
        type: 'Implementation',
        activity: item.activity || '',
        responsible: Array.isArray(item.responsible) ? item.responsible.join(', ') : '',
        timeline: item.timeline || '',
        status: item.status || '',
        costs: item.costs || ''
      });
    });
  }
  
  if (data.monitoring && Array.isArray(data.monitoring)) {
    data.monitoring.forEach(item => {
      flattened.push({
        type: 'Monitoring',
        metric: item.metric || '',
        frequency: item.frequency || '',
        baseline: item.baseline || '',
        target: item.target || '',
        responsible: Array.isArray(item.responsible) ? item.responsible.join(', ') : ''
      });
    });
  }
  
  // Handle environmental assessments
  if (data.impacts && Array.isArray(data.impacts)) {
    data.impacts.forEach(impact => {
      flattened.push({
        type: 'Impact',
        category: impact.category || '',
        description: impact.description || '',
        significance: impact.significance || '',
        mitigation: Array.isArray(impact.mitigation) ? impact.mitigation.join(', ') : ''
      });
    });
  }
  
  if (data.alternatives && Array.isArray(data.alternatives)) {
    data.alternatives.forEach(alt => {
      flattened.push({
        type: 'Alternative',
        name: alt.name || '',
        description: alt.description || '',
        impacts: alt.impacts || '',
        selected: alt.selected ? 'Yes' : 'No'
      });
    });
  }
  
  // If no data was flattened with specific handlers, try a generic approach
  if (flattened.length === 0) {
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            const flatItem = {
              section: key,
              index: index + 1
            };
            
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              if (Array.isArray(itemValue)) {
                flatItem[itemKey] = itemValue.join(', ');
              } else if (typeof itemValue !== 'object' || itemValue === null) {
                flatItem[itemKey] = itemValue;
              }
            });
            
            flattened.push(flatItem);
          }
        });
      }
    });
  }
  
  // If still no data was flattened, return a simple representation
  if (flattened.length === 0) {
    const simple = {};
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value !== 'object' || value === null) {
        simple[key] = value;
      } else if (typeof value === 'object') {
        simple[key] = 'Complex data - see JSON export';
      }
    });
    flattened.push(simple);
  }
  
  return flattened;
}

module.exports = router;