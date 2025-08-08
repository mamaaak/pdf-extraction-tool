/**
 * Mississippi Watershed Plan Extraction Accuracy Testing Framework
 * 
 * This script tests the accuracy of data extraction from Mississippi Watershed Plans
 * by comparing extracted data against manually verified ground truth data.
 * 
 * Usage: node watershedAccuracyTest.js [--verbose] [--pdf-only] [--plan-name=<name>]
 */
const fs = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../../src/services/pdfService');
const { extractWatershedData } = require('../../src/services/watershedExtractor');
const { DocumentTypes, extractDocumentData } = require('../../src/services/documentExtractor');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Configure test settings
const settings = {
  testDataDir: path.join(__dirname, '../data'),
  groundTruthDir: path.join(__dirname, '../data/ground-truth'),
  resultsDir: path.join(__dirname, '../results'),
  minRequiredAccuracy: 75, // Minimum required accuracy percentage
  verbose: process.argv.includes('--verbose'),
  pdfOnly: process.argv.includes('--pdf-only')
};

// Parse command line arguments
const planNameArg = process.argv.find(arg => arg.startsWith('--plan-name='));
const specificPlan = planNameArg ? planNameArg.split('=')[1] : null;

// Ensure directories exist
[settings.testDataDir, settings.groundTruthDir, settings.resultsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Ground truth data for testing - manually verified data from sample watershed plans
 * This would normally be loaded from JSON files in the ground-truth directory
 */
const groundTruthData = {
  'deer-creek': {
    goals: [
      { id: 'G1', description: 'Reduce sediment loading by 50%', status: 'In Progress' },
      { id: 'G2', description: 'Improve water quality to support aquatic life', status: 'In Progress' },
      { id: 'G3', description: 'Implement BMPs across 75% of agricultural lands', status: 'Not Started' },
    ],
    bmps: [
      { id: 'BMP1', name: 'No-till farming', category: 'Agricultural' },
      { id: 'BMP2', name: 'Streambank stabilization', category: 'Hydrological' },
      { id: 'BMP3', name: 'Buffer strips', category: 'Agricultural' },
    ],
    monitoring: [
      { metric: 'Sediment load', frequency: 'Monthly' },
      { metric: 'Nutrient concentrations', frequency: 'Quarterly' },
      { metric: 'Benthic macroinvertebrate assessment', frequency: 'Annually' },
    ],
  },
  'harris-bayou': {
    goals: [
      { id: 'G1', description: 'Reduce nitrogen loading by 30%', status: 'Complete' },
      { id: 'G2', description: 'Reduce phosphorus loading by 35%', status: 'In Progress' },
      { id: 'G3', description: 'Reduce sediment loading by 40%', status: 'In Progress' },
    ],
    bmps: [
      { id: 'BMP1', name: 'Nutrient management', category: 'Agricultural' },
      { id: 'BMP2', name: 'Cover crops', category: 'Agricultural' },
      { id: 'BMP3', name: 'Water control structures', category: 'Hydrological' },
    ],
    monitoring: [
      { metric: 'Nitrogen concentration', frequency: 'Monthly' },
      { metric: 'Phosphorus concentration', frequency: 'Monthly' },
      { metric: 'Turbidity', frequency: 'Weekly' },
    ],
  }
  // Additional ground truth data can be added for other watershed plans
};

/**
 * Main test function
 */
async function runAccuracyTests() {
  console.log('='.repeat(80));
  console.log('MISSISSIPPI WATERSHED PLAN EXTRACTION ACCURACY TESTING');
  console.log('='.repeat(80));
  
  if (!process.env.GROQ_API_KEY) {
    console.error('Error: GROQ_API_KEY environment variable not set.');
    console.error('Please ensure your .env file has the required API key.');
    process.exit(1);
  }

  // Get all PDF files in test data directory
  const testFiles = fs.readdirSync(settings.testDataDir)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .filter(file => !specificPlan || file.toLowerCase().includes(specificPlan.toLowerCase()));

  if (testFiles.length === 0) {
    console.error(`No test PDF files found${specificPlan ? ` matching "${specificPlan}"` : ''}!`);
    console.error(`Please add watershed plan PDFs to ${settings.testDataDir}`);
    process.exit(1);
  }

  const testResults = {
    testDate: new Date().toISOString(),
    overall: {
      totalFiles: testFiles.length,
      filesProcessed: 0,
      filesSucceeded: 0,
      averageAccuracy: 0,
      goalAccuracy: 0,
      bmpAccuracy: 0,
      monitoringAccuracy: 0,
      zeroFalsePositives: true
    },
    files: []
  };

  console.log(`Found ${testFiles.length} test file(s). Starting tests...\n`);

  // Process each test file
  for (const file of testFiles) {
    const filePath = path.join(settings.testDataDir, file);
    console.log(`Testing file: ${file}`);
    
    try {
      // Extract the "planId" from filename (e.g., "deer-creek-watershed-plan.pdf" -> "deer-creek")
      const planId = getPlanIdFromFilename(file);
      const groundTruth = groundTruthData[planId];
      
      if (!groundTruth) {
        console.warn(`Warning: No ground truth data found for "${planId}". Skipping accuracy measurement.`);
      }
      
      // Step 1: Extract text from PDF
      console.log('  Extracting text from PDF...');
      const pdfText = await extractTextFromPDF(filePath);
      
      if (settings.pdfOnly) {
        console.log(`  Text extracted (${pdfText.length} characters)`);
        console.log('  PDF text extraction only mode. Skipping further processing.');
        continue;
      }
      
      // Step 2: Process with watershed extractor
      console.log('  Processing with watershed extractor...');
      const extractionResult = await extractWatershedData(pdfText);
      
      // Step 3: Also try with document extractor for comparison
      console.log('  Processing with general document extractor...');
      const docExtractionResult = await extractDocumentData(pdfText, { 
        documentType: DocumentTypes.WATERSHED_PLAN
      });
      
      // Step 4: Measure accuracy against ground truth (if available)
      let accuracyResults = null;
      if (groundTruth) {
        console.log('  Measuring accuracy against ground truth...');
        accuracyResults = measureAccuracy(extractionResult.data, groundTruth);
        
        console.log(`  Results:`);
        console.log(`    Overall Accuracy: ${accuracyResults.overall.toFixed(1)}%`);
        console.log(`    Goals Accuracy: ${accuracyResults.goals.toFixed(1)}%`);
        console.log(`    BMPs Accuracy: ${accuracyResults.bmps.toFixed(1)}%`);
        console.log(`    Monitoring Accuracy: ${accuracyResults.monitoring.toFixed(1)}%`);
        console.log(`    False Positives: ${accuracyResults.falsePositives}`);
        if (accuracyResults.falsePositives > 0) {
          testResults.overall.zeroFalsePositives = false;
        }
      }
      
      // Step 5: Save the results
      const fileResult = {
        fileName: file,
        planId,
        processingTime: new Date().toISOString(),
        extractorConfidence: extractionResult.confidence,
        generalExtractorConfidence: docExtractionResult.confidence,
        textLength: pdfText.length,
        accuracy: accuracyResults,
        extractedData: extractionResult.data,
        validationDetails: extractionResult.validation
      };
      
      testResults.files.push(fileResult);
      testResults.overall.filesProcessed++;
      
      if (accuracyResults && accuracyResults.overall >= settings.minRequiredAccuracy) {
        testResults.overall.filesSucceeded++;
      }
      
      // Save individual test result to file
      const resultFile = path.join(settings.resultsDir, `${planId}-result.json`);
      fs.writeFileSync(resultFile, JSON.stringify(fileResult, null, 2));
      console.log(`  Result saved to ${resultFile}`);
      
    } catch (error) {
      console.error(`  Error processing ${file}:`, error);
      testResults.files.push({
        fileName: file,
        error: error.message || 'Unknown error'
      });
    }
    
    console.log(''); // Add a blank line between files
  }

  // Calculate overall statistics
  if (testResults.overall.filesProcessed > 0) {
    const accuracyResults = testResults.files
      .filter(f => f.accuracy)
      .map(f => f.accuracy);
    
    if (accuracyResults.length > 0) {
      testResults.overall.averageAccuracy = 
        accuracyResults.reduce((sum, acc) => sum + acc.overall, 0) / accuracyResults.length;
      
      testResults.overall.goalAccuracy = 
        accuracyResults.reduce((sum, acc) => sum + acc.goals, 0) / accuracyResults.length;
      
      testResults.overall.bmpAccuracy = 
        accuracyResults.reduce((sum, acc) => sum + acc.bmps, 0) / accuracyResults.length;
      
      testResults.overall.monitoringAccuracy = 
        accuracyResults.reduce((sum, acc) => sum + acc.monitoring, 0) / accuracyResults.length;
    }
  }

  // Save overall test results
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const summaryFile = path.join(settings.resultsDir, `summary-${timestamp}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(testResults, null, 2));

  // Print summary
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Files Processed: ${testResults.overall.filesProcessed}/${testResults.overall.totalFiles}`);
  console.log(`Files Meeting Accuracy Threshold (≥${settings.minRequiredAccuracy}%): ${testResults.overall.filesSucceeded}`);
  console.log(`Average Accuracy: ${testResults.overall.averageAccuracy.toFixed(1)}%`);
  console.log(`Goal Accuracy: ${testResults.overall.goalAccuracy.toFixed(1)}%`);
  console.log(`BMP Accuracy: ${testResults.overall.bmpAccuracy.toFixed(1)}%`);
  console.log(`Monitoring Accuracy: ${testResults.overall.monitoringAccuracy.toFixed(1)}%`);
  console.log(`Zero False Positives: ${testResults.overall.zeroFalsePositives ? 'Yes' : 'No'}`);
  console.log(`Results saved to ${summaryFile}`);
  console.log('='.repeat(80));

  // Determine overall pass/fail
  const passed = testResults.overall.averageAccuracy >= settings.minRequiredAccuracy;
  console.log(`OVERALL TEST RESULT: ${passed ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(80));

  return testResults;
}

/**
 * Extract a standardized plan ID from the filename
 * @param {string} filename - The PDF filename
 * @returns {string} - Standardized plan ID
 */
function getPlanIdFromFilename(filename) {
  // Remove file extension
  let name = filename.replace(/\.pdf$/i, '');
  
  // Convert to lowercase and replace spaces/underscores with hyphens
  name = name.toLowerCase().replace(/[\s_]+/g, '-');
  
  // Remove words like "watershed", "plan", "management"
  name = name.replace(/-?(watershed|plan|management|final|draft|report)(-|$)/g, '-');
  
  // Clean up any duplicate or trailing hyphens
  name = name.replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
  
  // Get the first two words (if they exist)
  const parts = name.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  
  return name;
}

/**
 * Measure accuracy by comparing extracted data against ground truth
 * @param {Object} extractedData - Extracted watershed data
 * @param {Object} groundTruth - Manually verified ground truth data
 * @returns {Object} - Accuracy metrics
 */
function measureAccuracy(extractedData, groundTruth) {
  if (!extractedData || !groundTruth) {
    return {
      overall: 0,
      goals: 0,
      bmps: 0,
      monitoring: 0,
      falsePositives: 0,
      details: {
        goals: { found: 0, total: 0, matches: [], misses: [] },
        bmps: { found: 0, total: 0, matches: [], misses: [] },
        monitoring: { found: 0, total: 0, matches: [], misses: [] }
      }
    };
  }
  
  // Initialize result object
  const result = {
    overall: 0,
    goals: 0,
    bmps: 0, 
    monitoring: 0,
    falsePositives: 0,
    details: {
      goals: { found: 0, total: groundTruth.goals?.length || 0, matches: [], misses: [] },
      bmps: { found: 0, total: groundTruth.bmps?.length || 0, matches: [], misses: [] },
      monitoring: { found: 0, total: groundTruth.monitoring?.length || 0, matches: [], misses: [] }
    }
  };

  // Check goals
  if (groundTruth.goals && extractedData.goals) {
    groundTruth.goals.forEach(groundTruthGoal => {
      // Check if this goal was extracted
      const matchingGoal = extractedData.goals.find(goal => {
        // Check for match on description (most reliable field)
        return stringSimilarity(goal.description, groundTruthGoal.description) >= 0.7;
      });
      
      if (matchingGoal) {
        result.details.goals.found++;
        result.details.goals.matches.push({
          groundTruth: groundTruthGoal,
          extracted: matchingGoal
        });
      } else {
        result.details.goals.misses.push({
          groundTruth: groundTruthGoal,
          reason: 'Not found in extracted data'
        });
      }
    });
    
    // Check for false positives (extracted items not in ground truth)
    extractedData.goals.forEach(extractedGoal => {
      const isMatch = groundTruth.goals.some(goal => 
        stringSimilarity(extractedGoal.description, goal.description) >= 0.7);
      
      if (!isMatch) {
        result.falsePositives++;
        if (settings.verbose) {
          console.log(`  False positive goal: "${extractedGoal.description}"`);
        }
      }
    });
    
    result.goals = result.details.goals.total > 0 
      ? (result.details.goals.found / result.details.goals.total) * 100
      : 0;
  }
  
  // Check BMPs
  if (groundTruth.bmps && extractedData.bmps) {
    groundTruth.bmps.forEach(groundTruthBmp => {
      // Check if this BMP was extracted
      const matchingBmp = extractedData.bmps.find(bmp => {
        // Check for match on name (most reliable field)
        return stringSimilarity(bmp.name, groundTruthBmp.name) >= 0.7;
      });
      
      if (matchingBmp) {
        result.details.bmps.found++;
        result.details.bmps.matches.push({
          groundTruth: groundTruthBmp,
          extracted: matchingBmp
        });
      } else {
        result.details.bmps.misses.push({
          groundTruth: groundTruthBmp,
          reason: 'Not found in extracted data'
        });
      }
    });
    
    // Check for false positives (extracted items not in ground truth)
    extractedData.bmps.forEach(extractedBmp => {
      const isMatch = groundTruth.bmps.some(bmp => 
        stringSimilarity(extractedBmp.name, bmp.name) >= 0.7);
      
      if (!isMatch) {
        result.falsePositives++;
        if (settings.verbose) {
          console.log(`  False positive BMP: "${extractedBmp.name}"`);
        }
      }
    });
    
    result.bmps = result.details.bmps.total > 0 
      ? (result.details.bmps.found / result.details.bmps.total) * 100
      : 0;
  }
  
  // Check monitoring metrics (quantitative metrics accuracy)
  if (groundTruth.monitoring && extractedData.monitoring) {
    groundTruth.monitoring.forEach(groundTruthMetric => {
      // Check if this metric was extracted
      const matchingMetric = extractedData.monitoring.find(metric => {
        // Check for match on metric name
        return stringSimilarity(metric.metric, groundTruthMetric.metric) >= 0.7;
      });
      
      if (matchingMetric) {
        result.details.monitoring.found++;
        result.details.monitoring.matches.push({
          groundTruth: groundTruthMetric,
          extracted: matchingMetric
        });
      } else {
        result.details.monitoring.misses.push({
          groundTruth: groundTruthMetric,
          reason: 'Not found in extracted data'
        });
      }
    });
    
    // Check for false positives (extracted items not in ground truth)
    extractedData.monitoring.forEach(extractedMetric => {
      const isMatch = groundTruth.monitoring.some(metric => 
        stringSimilarity(extractedMetric.metric, metric.metric) >= 0.7);
      
      if (!isMatch) {
        result.falsePositives++;
        if (settings.verbose) {
          console.log(`  False positive monitoring metric: "${extractedMetric.metric}"`);
        }
      }
    });
    
    result.monitoring = result.details.monitoring.total > 0 
      ? (result.details.monitoring.found / result.details.monitoring.total) * 100
      : 0;
  }
  
  // Calculate overall accuracy (weighted average)
  const totalWeight = (result.details.goals.total > 0 ? 1 : 0) +
                     (result.details.bmps.total > 0 ? 1 : 0) +
                     (result.details.monitoring.total > 0 ? 1 : 0);
                     
  if (totalWeight > 0) {
    result.overall = (
      (result.goals * (result.details.goals.total > 0 ? 1 : 0)) +
      (result.bmps * (result.details.bmps.total > 0 ? 1 : 0)) +
      (result.monitoring * (result.details.monitoring.total > 0 ? 1 : 0))
    ) / totalWeight;
  }
  
  return result;
}

/**
 * Calculate string similarity using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score between 0-1
 */
function stringSimilarity(str1, str2) {
  if (!str1 && !str2) return 1; // Both empty = perfect match
  if (!str1 || !str2) return 0; // One empty = no match
  
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();
  
  // For very short strings, require exact match
  if (str1.length < 5 || str2.length < 5) {
    return str1 === str2 ? 1 : 0;
  }
  
  // For longer strings, calculate Levenshtein distance
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create matrix of distances
  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,        // deletion
        matrix[i][j - 1] + 1,        // insertion
        matrix[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  
  // Calculate similarity as a value between 0-1
  const maxDistance = Math.max(len1, len2);
  return maxDistance > 0 ? 1 - matrix[len1][len2] / maxDistance : 1;
}

// Run the tests when script is executed directly
if (require.main === module) {
  runAccuracyTests();
}

module.exports = {
  runAccuracyTests,
  measureAccuracy,
  stringSimilarity
};