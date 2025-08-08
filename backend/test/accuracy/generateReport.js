/**
 * Generate Markdown Report from Accuracy Test Results
 * 
 * This script creates a Markdown report from the JSON test results.
 * 
 * Usage: node generateReport.js [result-file.json]
 */
const fs = require('fs');
const path = require('path');

// Configure settings
const settings = {
  resultsDir: path.join(__dirname, '../results')
};

/**
 * Generate a Markdown report from test results
 * @param {Object} results - Test results object
 * @returns {string} - Markdown report
 */
function generateMarkdownReport(results) {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  
  let markdown = `# Watershed Plan Extraction Accuracy Report\n\n`;
  markdown += `Generated: ${timestamp}\n\n`;
  
  // Overall summary
  markdown += `## Summary\n\n`;
  markdown += `- **Files Processed**: ${results.overall.filesProcessed}/${results.overall.totalFiles}\n`;
  markdown += `- **Files Meeting Accuracy Threshold (≥75%)**: ${results.overall.filesSucceeded}\n`;
  markdown += `- **Average Accuracy**: ${results.overall.averageAccuracy.toFixed(1)}%\n`;
  markdown += `- **Goal Accuracy**: ${results.overall.goalAccuracy.toFixed(1)}%\n`;
  markdown += `- **BMP Accuracy**: ${results.overall.bmpAccuracy.toFixed(1)}%\n`;
  markdown += `- **Monitoring Accuracy**: ${results.overall.monitoringAccuracy.toFixed(1)}%\n\n`;
  
  // Overall result
  const passed = results.overall.averageAccuracy >= 75;
  markdown += `**Overall Test Result**: ${passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  // Individual file results
  markdown += `## Individual File Results\n\n`;
  
  results.files.forEach((file, index) => {
    markdown += `### ${index + 1}. ${file.fileName}\n\n`;
    
    if (file.error) {
      markdown += `❌ **Error**: ${file.error}\n\n`;
      return;
    }
    
    const fileAccuracy = file.accuracy?.overall || 0;
    const passedThreshold = fileAccuracy >= 75;
    
    markdown += `${passedThreshold ? '✅' : '❌'} **Accuracy**: ${fileAccuracy.toFixed(1)}%\n\n`;
    
    markdown += `- **Extractor Confidence**: ${file.extractorConfidence}%\n`;
    markdown += `- **General Extractor Confidence**: ${file.generalExtractorConfidence}%\n`;
    markdown += `- **Text Length**: ${file.textLength.toLocaleString()} characters\n\n`;
    
    if (file.accuracy) {
      markdown += `#### Accuracy Breakdown\n\n`;
      markdown += `| Category | Accuracy | Found | Total |\n`;
      markdown += `|----------|----------|-------|-------|\n`;
      
      if (file.accuracy.details.goals) {
        markdown += `| Goals | ${file.accuracy.goals.toFixed(1)}% | ${file.accuracy.details.goals.found} | ${file.accuracy.details.goals.total} |\n`;
      }
      
      if (file.accuracy.details.bmps) {
        markdown += `| BMPs | ${file.accuracy.bmps.toFixed(1)}% | ${file.accuracy.details.bmps.found} | ${file.accuracy.details.bmps.total} |\n`;
      }
      
      if (file.accuracy.details.monitoring) {
        markdown += `| Monitoring | ${file.accuracy.monitoring.toFixed(1)}% | ${file.accuracy.details.monitoring.found} | ${file.accuracy.details.monitoring.total} |\n`;
      }
      
      markdown += `\n**False Positives**: ${file.accuracy.falsePositives}\n\n`;
      
      // Add details about specific matches and misses
      if (file.accuracy.details.goals.misses && file.accuracy.details.goals.misses.length > 0) {
        markdown += `#### Missed Goals\n\n`;
        file.accuracy.details.goals.misses.forEach(miss => {
          markdown += `- "${miss.groundTruth.description}"\n`;
        });
        markdown += `\n`;
      }
      
      if (file.accuracy.details.bmps.misses && file.accuracy.details.bmps.misses.length > 0) {
        markdown += `#### Missed BMPs\n\n`;
        file.accuracy.details.bmps.misses.forEach(miss => {
          markdown += `- "${miss.groundTruth.name}"\n`;
        });
        markdown += `\n`;
      }
    }
  });
  
  // Add notes about edge cases and challenges
  markdown += `## Edge Cases and Challenges\n\n`;
  markdown += `The following edge cases and challenges were observed during testing:\n\n`;
  markdown += `1. **Format Variations**: Different watershed plans use varying formats for presenting similar information.\n`;
  markdown += `2. **Implicit Goals**: Some documents don't explicitly label goals but embed them in narrative text.\n`;
  markdown += `3. **Abbreviated BMPs**: BMPs are sometimes referred to by abbreviations or technical codes.\n`;
  markdown += `4. **Inconsistent Metrics**: Monitoring metrics are described with inconsistent terminology.\n`;
  markdown += `5. **Missing Information**: Some plans lack complete information for certain categories.\n`;
  
  return markdown;
}

/**
 * Main function to generate report
 */
async function generateReport() {
  try {
    // Determine which results file to use
    let resultsFile;
    
    if (process.argv.length > 2) {
      // Use specified file
      resultsFile = process.argv[2];
      if (!path.isAbsolute(resultsFile)) {
        resultsFile = path.join(settings.resultsDir, resultsFile);
      }
    } else {
      // Use the most recent results file
      const files = fs.readdirSync(settings.resultsDir)
        .filter(file => file.startsWith('summary-') && file.endsWith('.json'))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(settings.resultsDir, a));
          const statB = fs.statSync(path.join(settings.resultsDir, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        });
        
      if (files.length === 0) {
        console.error('No test result files found. Run tests first.');
        process.exit(1);
      }
      
      resultsFile = path.join(settings.resultsDir, files[0]);
    }
    
    if (!fs.existsSync(resultsFile)) {
      console.error(`Error: Results file not found: ${resultsFile}`);
      process.exit(1);
    }
    
    console.log(`Generating report from: ${resultsFile}`);
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    
    // Generate markdown report
    const markdown = generateMarkdownReport(results);
    
    // Save report
    const reportFilename = path.basename(resultsFile, '.json') + '.md';
    const reportPath = path.join(settings.resultsDir, reportFilename);
    fs.writeFileSync(reportPath, markdown);
    
    console.log(`Report saved to: ${reportPath}`);
    
    // Also update the main TESTING.md with the latest results
    updateTestingMd(results);
    
  } catch (error) {
    console.error('Error generating report:', error);
  }
}

/**
 * Update the main TESTING.md file with the latest test results
 * @param {Object} results - Test results
 */
function updateTestingMd(results) {
  const testingMdPath = path.join(__dirname, '../../../TESTING.md');
  
  if (!fs.existsSync(testingMdPath)) {
    console.warn('Warning: TESTING.md file not found, skipping update.');
    return;
  }
  
  let testingMd = fs.readFileSync(testingMdPath, 'utf8');
  
  // Find the section for watershed extractor testing results
  const sectionMarker = '### Watershed Extractor Accuracy Results';
  
  const sectionIndex = testingMd.indexOf(sectionMarker);
  
  // Create the new section content
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  let newSection = `${sectionMarker}\n\n`;
  newSection += `Last updated: ${timestamp}\n\n`;
  newSection += `| Metric | Result | Target |\n`;
  newSection += `|--------|--------|--------|\n`;
  newSection += `| Overall Accuracy | ${results.overall.averageAccuracy.toFixed(1)}% | ≥75% |\n`;
  newSection += `| Goal Accuracy | ${results.overall.goalAccuracy.toFixed(1)}% | ≥75% |\n`;
  newSection += `| BMP Accuracy | ${results.overall.bmpAccuracy.toFixed(1)}% | ≥75% |\n`;
  newSection += `| Monitoring Accuracy | ${results.overall.monitoringAccuracy.toFixed(1)}% | ≥75% |\n`;
  newSection += `| Files Tested | ${results.overall.filesProcessed} | - |\n`;
  newSection += `| Files Passed | ${results.overall.filesSucceeded} | - |\n\n`;
  
  const passed = results.overall.averageAccuracy >= 75;
  newSection += `**Status**: ${passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  // Add information about edge cases
  newSection += `#### Edge Cases and Challenges\n\n`;
  newSection += `The testing process identified several challenges in watershed plan extraction:\n\n`;
  newSection += `1. **Format Variations**: Different watershed plans use varying formats and structures.\n`;
  newSection += `2. **Implicit Information**: Some documents don't explicitly label goals or BMPs.\n`;
  newSection += `3. **Technical Terminology**: Domain-specific abbreviations and terms vary across documents.\n`;
  newSection += `4. **Missing Data**: Some plans have incomplete information in certain sections.\n`;
  newSection += `5. **Mixed Content**: Goals and BMPs sometimes appear in narrative text rather than structured lists.\n\n`;
  
  if (sectionIndex !== -1) {
    // Find the end of the section (next heading or end of file)
    const nextSectionMatch = testingMd.slice(sectionIndex).match(/\n##/);
    const nextSectionIndex = nextSectionMatch
      ? sectionIndex + nextSectionMatch.index
      : testingMd.length;
    
    // Replace the existing section
    testingMd = testingMd.slice(0, sectionIndex) + newSection + testingMd.slice(nextSectionIndex);
  } else {
    // Add the section at the end of the file
    testingMd += `\n${newSection}`;
  }
  
  // Write the updated file
  fs.writeFileSync(testingMdPath, testingMd);
  console.log(`Updated ${testingMdPath} with the latest test results.`);
}

// Run when script is executed directly
if (require.main === module) {
  generateReport();
}

module.exports = { generateMarkdownReport };