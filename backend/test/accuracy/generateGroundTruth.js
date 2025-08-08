/**
 * Ground Truth Data Generator for Mississippi Watershed Plans
 * 
 * This script helps create or update ground truth data for watershed plans
 * to be used in accuracy testing.
 * 
 * Usage: node generateGroundTruth.js <pdf-file>
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { extractTextFromPDF } = require('../../src/services/pdfService');
const { extractWatershedData } = require('../../src/services/watershedExtractor');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Configure settings
const settings = {
  testDataDir: path.join(__dirname, '../data'),
  groundTruthDir: path.join(__dirname, '../data/ground-truth')
};

// Ensure directories exist
[settings.groundTruthDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Extracts a plan ID from filename
 * @param {string} filename - PDF filename
 * @returns {string} - Plan ID
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
 * Ask user questions to confirm or correct extracted data
 * @param {string} question - Question to ask
 * @param {string} defaultValue - Default value
 * @returns {Promise<string>} - User response
 */
function promptUser(question, defaultValue = '') {
  const defaultPrompt = defaultValue ? ` [${defaultValue}]` : '';
  
  return new Promise((resolve) => {
    rl.question(`${question}${defaultPrompt}: `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Main function to generate ground truth data
 */
async function generateGroundTruth() {
  try {
    // Check for PDF file argument
    if (process.argv.length < 3) {
      console.error('Error: Please provide a PDF file name as an argument.');
      console.error('Usage: node generateGroundTruth.js <pdf-file>');
      process.exit(1);
    }
    
    const pdfFileName = process.argv[2];
    const pdfPath = path.join(settings.testDataDir, pdfFileName);
    
    if (!fs.existsSync(pdfPath)) {
      console.error(`Error: File does not exist: ${pdfPath}`);
      process.exit(1);
    }
    
    console.log('='.repeat(80));
    console.log('GROUND TRUTH DATA GENERATOR');
    console.log('='.repeat(80));
    console.log(`Processing: ${pdfFileName}\n`);
    
    // Extract plan ID from filename
    const planId = getPlanIdFromFilename(pdfFileName);
    console.log(`Plan ID: ${planId}\n`);
    
    // Extract text from PDF
    console.log('Extracting text from PDF...');
    const pdfText = await extractTextFromPDF(pdfPath);
    console.log(`Extracted ${pdfText.length} characters.\n`);
    
    // Get automatic extraction to use as a starting point
    console.log('Running automatic extraction (this may take a minute)...');
    const extractionResult = await extractWatershedData(pdfText);
    console.log('Extraction completed.\n');
    
    // Check if ground truth already exists
    const groundTruthPath = path.join(settings.groundTruthDir, `${planId}.json`);
    let groundTruth = {};
    
    if (fs.existsSync(groundTruthPath)) {
      console.log(`Found existing ground truth data at: ${groundTruthPath}`);
      groundTruth = JSON.parse(fs.readFileSync(groundTruthPath, 'utf8'));
      console.log('You can update the existing data or press Enter to keep existing values.\n');
    }
    
    // Interactive session to create/verify ground truth data
    console.log('=== Plan Metadata ===');
    const title = await promptUser('Plan title', groundTruth.title || extractionResult.data.metadata?.title || '');
    const author = await promptUser('Author/organization', groundTruth.author || extractionResult.data.metadata?.author || '');
    
    console.log('\n=== Goals ===');
    const goals = [];
    
    // Use extracted goals as starting point
    const existingGoals = groundTruth.goals || [];
    const extractedGoals = extractionResult.data.goals || [];
    
    // Combine and deduplicate goals
    const combinedGoals = [...existingGoals];
    
    for (const extractedGoal of extractedGoals) {
      // Check if this goal already exists
      const exists = combinedGoals.some(g => 
        g.description && extractedGoal.description && 
        g.description.toLowerCase() === extractedGoal.description.toLowerCase()
      );
      
      if (!exists) {
        combinedGoals.push(extractedGoal);
      }
    }
    
    console.log(`Found ${combinedGoals.length} potential goals.`);
    
    for (let i = 0; i < combinedGoals.length; i++) {
      const goal = combinedGoals[i];
      console.log(`\nGoal ${i + 1}:`);
      
      const includeGoal = await promptUser('Include this goal? (y/n)', 'y');
      if (includeGoal.toLowerCase() !== 'y') continue;
      
      const description = await promptUser('Description', goal.description || '');
      const status = await promptUser('Status (Complete/In Progress/Not Started)', goal.status || 'Not Started');
      
      goals.push({
        id: `G${goals.length + 1}`,
        description,
        status
      });
    }
    
    // Allow adding more goals
    let addMore = await promptUser('\nAdd more goals? (y/n)', 'n');
    while (addMore.toLowerCase() === 'y') {
      const description = await promptUser('Description', '');
      if (!description) break;
      
      const status = await promptUser('Status (Complete/In Progress/Not Started)', 'Not Started');
      
      goals.push({
        id: `G${goals.length + 1}`,
        description,
        status
      });
      
      addMore = await promptUser('Add another goal? (y/n)', 'n');
    }
    
    console.log('\n=== BMPs (Best Management Practices) ===');
    const bmps = [];
    
    // Use extracted BMPs as starting point
    const existingBMPs = groundTruth.bmps || [];
    const extractedBMPs = extractionResult.data.bmps || [];
    
    // Combine and deduplicate BMPs
    const combinedBMPs = [...existingBMPs];
    
    for (const extractedBMP of extractedBMPs) {
      // Check if this BMP already exists
      const exists = combinedBMPs.some(b => 
        b.name && extractedBMP.name && 
        b.name.toLowerCase() === extractedBMP.name.toLowerCase()
      );
      
      if (!exists) {
        combinedBMPs.push(extractedBMP);
      }
    }
    
    console.log(`Found ${combinedBMPs.length} potential BMPs.`);
    
    for (let i = 0; i < combinedBMPs.length; i++) {
      const bmp = combinedBMPs[i];
      console.log(`\nBMP ${i + 1}:`);
      
      const includeBMP = await promptUser('Include this BMP? (y/n)', 'y');
      if (includeBMP.toLowerCase() !== 'y') continue;
      
      const name = await promptUser('Name', bmp.name || '');
      const category = await promptUser('Category', bmp.category || '');
      
      bmps.push({
        id: `BMP${bmps.length + 1}`,
        name,
        category
      });
    }
    
    // Allow adding more BMPs
    addMore = await promptUser('\nAdd more BMPs? (y/n)', 'n');
    while (addMore.toLowerCase() === 'y') {
      const name = await promptUser('Name', '');
      if (!name) break;
      
      const category = await promptUser('Category', '');
      
      bmps.push({
        id: `BMP${bmps.length + 1}`,
        name,
        category
      });
      
      addMore = await promptUser('Add another BMP? (y/n)', 'n');
    }
    
    console.log('\n=== Monitoring Metrics ===');
    const monitoring = [];
    
    // Use extracted monitoring metrics as starting point
    const existingMetrics = groundTruth.monitoring || [];
    const extractedMetrics = extractionResult.data.monitoring || [];
    
    // Combine and deduplicate monitoring metrics
    const combinedMetrics = [...existingMetrics];
    
    for (const extractedMetric of extractedMetrics) {
      // Check if this metric already exists
      const exists = combinedMetrics.some(m => 
        m.metric && extractedMetric.metric && 
        m.metric.toLowerCase() === extractedMetric.metric.toLowerCase()
      );
      
      if (!exists) {
        combinedMetrics.push(extractedMetric);
      }
    }
    
    console.log(`Found ${combinedMetrics.length} potential monitoring metrics.`);
    
    for (let i = 0; i < combinedMetrics.length; i++) {
      const metric = combinedMetrics[i];
      console.log(`\nMetric ${i + 1}:`);
      
      const includeMetric = await promptUser('Include this metric? (y/n)', 'y');
      if (includeMetric.toLowerCase() !== 'y') continue;
      
      const metricName = await promptUser('Metric name', metric.metric || '');
      const frequency = await promptUser('Frequency', metric.frequency || '');
      
      monitoring.push({
        metric: metricName,
        frequency
      });
    }
    
    // Allow adding more monitoring metrics
    addMore = await promptUser('\nAdd more monitoring metrics? (y/n)', 'n');
    while (addMore.toLowerCase() === 'y') {
      const metricName = await promptUser('Metric name', '');
      if (!metricName) break;
      
      const frequency = await promptUser('Frequency', '');
      
      monitoring.push({
        metric: metricName,
        frequency
      });
      
      addMore = await promptUser('Add another monitoring metric? (y/n)', 'n');
    }
    
    // Create ground truth object
    const updatedGroundTruth = {
      title,
      author,
      planId,
      goals,
      bmps,
      monitoring,
      lastUpdated: new Date().toISOString()
    };
    
    // Save ground truth data
    fs.writeFileSync(groundTruthPath, JSON.stringify(updatedGroundTruth, null, 2));
    console.log(`\nGround truth data saved to: ${groundTruthPath}`);
    
  } catch (error) {
    console.error('Error generating ground truth data:', error);
  } finally {
    rl.close();
  }
}

// Run when script is executed directly
if (require.main === module) {
  generateGroundTruth();
}

module.exports = { generateGroundTruth };