/**
 * Test utility for the documentExtractor
 * 
 * This utility allows testing the document data extraction logic with sample text
 * and provides a detailed accuracy report for different document types.
 */
const fs = require('fs');
const path = require('path');
const { extractDocumentData, DocumentTypes } = require('../services/documentExtractor');
const { extractTextFromPDF } = require('../services/pdfService');

/**
 * Tests the document extractor with sample text or PDF file
 * @param {string} inputPath - Path to sample text file or PDF
 * @param {boolean} isPdf - Whether the input is a PDF (otherwise treats as text)
 * @param {string} forceDocType - Optional document type to force analysis
 */
async function testDocumentExtractor(inputPath, isPdf = false, forceDocType = null) {
  try {
    console.log(`Testing document extractor with ${isPdf ? 'PDF' : 'text'} from: ${inputPath}`);
    if (forceDocType) {
      console.log(`Forcing document type: ${forceDocType}`);
    }
    
    // Get input text either from PDF or text file
    let text;
    if (isPdf) {
      // Extract text from PDF
      text = await extractTextFromPDF(inputPath);
    } else {
      // Read text file directly
      text = fs.readFileSync(inputPath, 'utf8');
    }
    
    console.log(`\nInput text length: ${text.length} characters`);
    console.log('Sample of input text:');
    console.log('--------------------');
    console.log(text.substring(0, 500) + '...');
    console.log('--------------------\n');
    
    // Extract data from the text
    console.log('Extracting data (this may take a minute)...');
    const startTime = Date.now();
    
    const options = {
      documentType: forceDocType,
      includeRawText: false
    };
    
    const result = await extractDocumentData(text, options);
    const endTime = Date.now();
    
    // Display results
    console.log(`\nExtraction completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log(`Document Type: ${result.documentType}`);
    console.log(`Confidence: ${result.confidence}%`);
    
    // Document metadata
    console.log('\n=== DOCUMENT METADATA ===');
    for (const [key, value] of Object.entries(result.metadata)) {
      console.log(`${key}: ${value || 'Not detected'}`);
    }
    
    // Document content summary
    console.log('\n=== CONTENT SUMMARY ===');
    logDocTypeSpecificSummary(result.data, result.documentType);
    
    // Validation details
    console.log('\n=== VALIDATION RESULTS ===');
    console.log(`Total checks performed: ${result.validation.totalChecks}`);
    console.log(`Checks passed: ${result.validation.passedChecks}`);
    console.log(`Accuracy: ${result.confidence}%`);
    
    if (result.validation.issues && result.validation.issues.length > 0) {
      console.log('\n=== VALIDATION ISSUES ===');
      result.validation.issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    }
    
    // Save the results to a file
    const outputDir = path.join(__dirname, '../../test-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputPath = path.join(outputDir, `${result.documentType}-extraction-${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`\nFull results saved to: ${outputPath}`);
    
    // Return the final confidence value
    return result.confidence;
  } catch (error) {
    console.error('Error testing document extractor:', error);
    throw error;
  }
}

/**
 * Log summary information based on document type
 * @param {Object} data - Extracted data
 * @param {string} docType - Document type
 */
function logDocTypeSpecificSummary(data, docType) {
  switch (docType) {
    case DocumentTypes.WATERSHED_PLAN:
      console.log(`Total Goals: ${data.summary?.totalGoals || 'N/A'}`);
      console.log(`Total BMPs: ${data.summary?.totalBMPs || 'N/A'}`);
      console.log(`Completion Rate: ${data.summary?.completionRate || 'N/A'}%`);
      console.log(`Goals: ${data.goals?.length || 0}`);
      console.log(`BMPs: ${data.bmps?.length || 0}`);
      console.log(`Implementation Activities: ${data.implementation?.length || 0}`);
      console.log(`Monitoring Metrics: ${data.monitoring?.length || 0}`);
      console.log(`Geographic Areas: ${data.geographicAreas?.length || 0}`);
      break;
      
    case DocumentTypes.ENVIRONMENTAL_ASSESSMENT:
      console.log(`Project Name: ${data.summary?.projectName || 'N/A'}`);
      console.log(`Lead Agency: ${data.summary?.leadAgency || 'N/A'}`);
      console.log(`Decision: ${data.summary?.decision || 'N/A'}`);
      console.log(`Impacts Identified: ${data.impacts?.length || 0}`);
      console.log(`Alternatives Evaluated: ${data.alternatives?.length || 0}`);
      console.log(`Mitigation Measures: ${data.mitigation?.length || 0}`);
      break;
      
    case DocumentTypes.AGRICULTURAL_REPORT:
      console.log(`Reporting Period: ${data.summary?.reportingPeriod || 'N/A'}`);
      console.log(`Region: ${data.summary?.region || 'N/A'}`);
      console.log(`Total Acreage: ${data.summary?.totalAcreage || 'N/A'}`);
      console.log(`Crops Analyzed: ${data.crops?.length || 0}`);
      console.log(`Soil Data Points: ${data.soilData?.length || 0}`);
      console.log(`Recommendations: ${data.recommendations?.length || 0}`);
      break;
      
    case DocumentTypes.CONSERVATION_PLAN:
      console.log(`Area: ${data.summary?.area || 'N/A'}`);
      console.log(`Timeframe: ${data.summary?.timeframe || 'N/A'}`);
      console.log(`Species Covered: ${data.species?.length || 0}`);
      console.log(`Habitats Identified: ${data.habitats?.length || 0}`);
      console.log(`Threats Identified: ${data.threats?.length || 0}`);
      console.log(`Conservation Actions: ${data.actions?.length || 0}`);
      break;
      
    case DocumentTypes.REGULATORY_DOCUMENT:
      console.log(`Regulation: ${data.summary?.regulation || 'N/A'}`);
      console.log(`Issuing Body: ${data.summary?.issuingBody || 'N/A'}`);
      console.log(`Effective Date: ${data.summary?.effectiveDate || 'N/A'}`);
      console.log(`Requirements: ${data.requirements?.length || 0}`);
      console.log(`Compliance Measures: ${data.compliance?.length || 0}`);
      console.log(`Exemptions: ${data.exemptions?.length || 0}`);
      console.log(`Deadlines: ${data.deadlines?.length || 0}`);
      break;
      
    case DocumentTypes.CLIMATE_STUDY:
      console.log(`Study Area: ${data.summary?.studyArea || 'N/A'}`);
      console.log(`Period: ${data.summary?.period || 'N/A'}`);
      console.log(`Observations: ${data.observations?.length || 0}`);
      console.log(`Projections: ${data.projections?.length || 0}`);
      console.log(`Impacts: ${data.impacts?.length || 0}`);
      console.log(`Adaptation Strategies: ${data.adaptation?.length || 0}`);
      console.log(`Mitigation Actions: ${data.mitigation?.length || 0}`);
      break;
      
    default:
      console.log(`Key Findings: ${data.summary?.keyFindings?.length || 0}`);
      console.log(`Data Categories: ${data.data?.length || 0}`);
      console.log(`Locations: ${data.locations?.length || 0}`);
      console.log(`Stakeholders: ${data.stakeholders?.length || 0}`);
      console.log(`Timeline Events: ${data.timeline?.length || 0}`);
      console.log(`Conclusions: ${data.conclusions?.length || 0}`);
      console.log(`Recommendations: ${data.recommendations?.length || 0}`);
  }
}

// Command-line interface for the tester
if (require.main === module) {
  // Check if input file path is provided
  if (process.argv.length < 3) {
    console.log('Usage: node documentExtractorTester.js <file-path> [--pdf] [--type=<document-type>]');
    console.log('\nAvailable document types:');
    Object.entries(DocumentTypes).forEach(([key, value]) => {
      console.log(`  ${value} (${key})`);
    });
    process.exit(1);
  }
  
  const inputPath = process.argv[2];
  const isPdf = process.argv.includes('--pdf');
  
  // Check for document type flag
  let docType = null;
  const typeArg = process.argv.find(arg => arg.startsWith('--type='));
  if (typeArg) {
    docType = typeArg.split('=')[1];
    // Validate document type
    if (!Object.values(DocumentTypes).includes(docType)) {
      console.log(`Invalid document type: ${docType}`);
      console.log('Available types:');
      Object.entries(DocumentTypes).forEach(([key, value]) => {
        console.log(`  ${value} (${key})`);
      });
      process.exit(1);
    }
  }
  
  testDocumentExtractor(inputPath, isPdf, docType)
    .then(confidence => {
      console.log(`\nTest completed with ${confidence}% confidence`);
      if (confidence < 75) {
        console.log('WARNING: Confidence below target threshold of 75%');
      }
    })
    .catch(err => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}

module.exports = { testDocumentExtractor };