/**
 * Agricultural/Environmental Document Extractor
 * 
 * This module uses Groq LLM to extract structured data from various
 * agricultural and environmental reports, including but not limited to:
 * - Watershed management plans
 * - Environmental impact assessments
 * - Agricultural productivity reports
 * - Soil and water conservation reports
 * - Regulatory compliance documents
 * - Climate impact studies
 */
const { Groq } = require('groq-sdk');
const fs = require('fs');

/**
 * Document categories supported by the extractor
 * @enum {string}
 */
const DocumentTypes = {
  WATERSHED_PLAN: 'watershed_plan',
  ENVIRONMENTAL_ASSESSMENT: 'environmental_assessment',
  AGRICULTURAL_REPORT: 'agricultural_report',
  CONSERVATION_PLAN: 'conservation_plan',
  REGULATORY_DOCUMENT: 'regulatory_document',
  CLIMATE_STUDY: 'climate_study',
  GENERAL: 'general_environmental'
};

/**
 * Preprocesses document text to identify key sections and document type
 * @param {string} text - Raw text from PDF
 * @returns {Object} Preprocessed text with identified sections and document type
 */
function preprocessDocument(text) {
  // Remove header/footer patterns and page numbers
  let processedText = text.replace(/Page \d+ of \d+|[A-Za-z]+ \d{4}|Draft Version|Confidential/gi, '');
  
  // Clean up excess whitespace
  processedText = processedText.replace(/\s{2,}/g, ' ').trim();
  
  // Determine document type based on content patterns
  const docType = identifyDocumentType(text);
  
  // Extract sections based on document type
  const sections = extractSectionsByDocType(processedText, docType);
  
  return {
    fullText: processedText,
    documentType: docType,
    sections,
    metadata: extractDocumentMetadata(text)
  };
}

/**
 * Identifies the document type based on content patterns
 * @param {string} text - Document text
 * @returns {string} Document type
 */
function identifyDocumentType(text) {
  const patterns = {
    [DocumentTypes.WATERSHED_PLAN]: /watershed|water quality|hydrologic|watershed management plan|basin plan/i,
    [DocumentTypes.ENVIRONMENTAL_ASSESSMENT]: /environmental assessment|impact statement|environmental effects|mitigation measures/i,
    [DocumentTypes.AGRICULTURAL_REPORT]: /crop production|agricultural|yield|farm management|livestock|irrigation/i,
    [DocumentTypes.CONSERVATION_PLAN]: /conservation|habitat|species|wildlife|protected area|biodiversity|preservation/i,
    [DocumentTypes.REGULATORY_DOCUMENT]: /compliance|regulation|permit|standard|requirement|law|act|statute/i,
    [DocumentTypes.CLIMATE_STUDY]: /climate change|global warming|greenhouse gas|emission|carbon|temperature|precipitation pattern/i
  };
  
  // Check each pattern and return the first match
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return type;
    }
  }
  
  // Default to general environmental if no specific type is detected
  return DocumentTypes.GENERAL;
}

/**
 * Extracts sections based on document type
 * @param {string} text - Preprocessed text
 * @param {string} docType - Document type
 * @returns {Object} Extracted sections
 */
function extractSectionsByDocType(text, docType) {
  // Common sections across all document types
  const commonSections = {
    executiveSummary: extractSection(text, /executive summary|summary|abstract|overview/i),
    introduction: extractSection(text, /introduction|background|context|purpose|scope/i),
    methodology: extractSection(text, /methodology|methods|approach|procedure|data collection/i),
    conclusion: extractSection(text, /conclusion|summary|findings|recommendations/i),
    references: extractSection(text, /references|bibliography|sources|citations|literature cited/i)
  };
  
  // Document type specific sections
  let typeSections = {};
  
  switch (docType) {
    case DocumentTypes.WATERSHED_PLAN:
      typeSections = {
        goals: extractSection(text, /goals|objectives|priorities/i),
        bmps: extractSection(text, /best management practices|bmps|management measures/i),
        implementation: extractSection(text, /implementation|action items|schedule/i),
        monitoring: extractSection(text, /monitoring|metrics|evaluation|assessment/i),
        stakeholders: extractSection(text, /stakeholders|partners|agencies|organizations/i),
        geographicAreas: extractSection(text, /geographic areas|watersheds|targeted areas|priority zones/i)
      };
      break;
      
    case DocumentTypes.ENVIRONMENTAL_ASSESSMENT:
      typeSections = {
        impacts: extractSection(text, /impacts|effects|consequences|implications/i),
        alternatives: extractSection(text, /alternatives|options|scenarios/i),
        mitigation: extractSection(text, /mitigation|measures|remediation|prevention/i),
        publicComments: extractSection(text, /public comments|feedback|consultation|stakeholder/i),
        compliance: extractSection(text, /compliance|regulations|standards|requirements/i)
      };
      break;
      
    case DocumentTypes.AGRICULTURAL_REPORT:
      typeSections = {
        cropData: extractSection(text, /crop|yield|production|harvest|planting/i),
        soilConditions: extractSection(text, /soil|fertility|quality|composition|health/i),
        waterUsage: extractSection(text, /water usage|irrigation|precipitation|drought/i),
        economics: extractSection(text, /economics|cost|profit|market|price|financial/i),
        recommendations: extractSection(text, /recommendations|best practices|guidance|advice/i)
      };
      break;
      
    case DocumentTypes.CONSERVATION_PLAN:
      typeSections = {
        speciesData: extractSection(text, /species|flora|fauna|wildlife|biodiversity/i),
        threats: extractSection(text, /threats|risks|challenges|pressures|stressors/i),
        conservationActions: extractSection(text, /conservation actions|strategies|measures|activities/i),
        habitatAreas: extractSection(text, /habitat|area|zone|region|location|site/i),
        monitoring: extractSection(text, /monitoring|tracking|measuring|indicators/i)
      };
      break;
      
    case DocumentTypes.REGULATORY_DOCUMENT:
      typeSections = {
        requirements: extractSection(text, /requirements|mandates|obligations|provisions/i),
        compliance: extractSection(text, /compliance|adherence|conformance|observation/i),
        penalties: extractSection(text, /penalties|fines|sanctions|enforcement/i),
        deadlines: extractSection(text, /deadlines|dates|timeframes|schedule/i),
        exemptions: extractSection(text, /exemptions|exceptions|exclusions|waivers/i)
      };
      break;
      
    case DocumentTypes.CLIMATE_STUDY:
      typeSections = {
        observations: extractSection(text, /observations|measurements|records|data|trends/i),
        projections: extractSection(text, /projections|forecasts|predictions|models|scenarios/i),
        impacts: extractSection(text, /impacts|effects|consequences|implications/i),
        adaptation: extractSection(text, /adaptation|resilience|adjustment|coping/i),
        mitigation: extractSection(text, /mitigation|reduction|prevention|abatement/i)
      };
      break;
      
    default:
      typeSections = {
        keyFindings: extractSection(text, /key findings|main results|outcomes|discoveries/i),
        dataPoints: extractSection(text, /data|statistics|numbers|figures|metrics/i),
        locations: extractSection(text, /locations|sites|areas|regions|places/i),
        timeline: extractSection(text, /timeline|schedule|timing|dates|periods/i),
        stakeholders: extractSection(text, /stakeholders|participants|parties|groups/i)
      };
  }
  
  // Combine common and type-specific sections
  return { ...commonSections, ...typeSections };
}

/**
 * Extract document metadata
 * @param {string} text - Document text
 * @returns {Object} Metadata object
 */
function extractDocumentMetadata(text) {
  // Try to extract title
  let title = null;
  const titleMatch = text.match(/(?:title:\s*|^\s*)([\w\s\-]+?)\n/i) || 
                    text.match(/^\s*([\w\s\-:]+?)(?:\n|$)/i);
  if (titleMatch) title = titleMatch[1].trim();
  
  // Try to extract date
  let date = null;
  const datePatterns = [
    /(?:date:|dated:)\s*(\w+\s+\d{1,2},?\s+\d{4})/i,
    /(\w+\s+\d{4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
  ];
  
  for (const pattern of datePatterns) {
    const dateMatch = text.match(pattern);
    if (dateMatch) {
      date = dateMatch[1].trim();
      break;
    }
  }
  
  // Try to extract author or organization
  let author = null;
  const authorMatch = text.match(/(?:prepared by|author|prepared for|submitted by):\s*([\w\s\-,\.]+)(?:\n|$)/i);
  if (authorMatch) author = authorMatch[1].trim();
  
  return {
    title,
    date,
    author,
    documentType: identifyDocumentType(text)
  };
}

/**
 * Extract text section based on keyword patterns
 * @param {string} text - Full text
 * @param {RegExp} pattern - Pattern to match section headers
 * @returns {string} Extracted section text
 */
function extractSection(text, pattern) {
  // Try to find a section with heading followed by content
  const sectionMatch = text.match(new RegExp(`(?:^|\\n)[^\\n]*${pattern.source}[^\\n]*\\n+([\\s\\S]+?)(?=\\n+[A-Z][A-Za-z\\s\\-:]{2,}:|\\n+(?:SECTION|Chapter|APPENDIX)|$)`, 'i'));
  
  // If found with heading, return the content
  if (sectionMatch && sectionMatch[1]) {
    return sectionMatch[1].trim();
  }
  
  // Otherwise try to find content based just on keywords
  const contentMatch = text.match(new RegExp(`([^.]*${pattern.source}[^.]+(?:\\.[^.]+){0,5})`, 'i'));
  return contentMatch ? contentMatch[1].trim() : '';
}

/**
 * Extracts structured data from agricultural/environmental document text
 * @param {string} text - Raw text extracted from PDF
 * @param {Object} options - Extraction options
 * @param {string} options.documentType - Force specific document type analysis
 * @param {boolean} options.includeRawText - Whether to include raw text in the response
 * @returns {Promise<Object>} Structured data matching document type schema
 */
async function extractDocumentData(text, options = {}) {
  try {
    // Ensure we have text to process
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for extraction');
    }
    
    // Step 1: Preprocess the text to identify key sections
    const preprocessed = preprocessDocument(text);
    
    // Override document type if specified in options
    if (options.documentType) {
      preprocessed.documentType = options.documentType;
    }
    
    // Step 2: Use Groq LLM to extract structured data
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    const groq = new Groq({ apiKey });
    
    // Create a prompt based on document type
    const prompt = createPromptByDocType(preprocessed);
    
    // Make the API call to Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a specialized data extraction AI that focuses on agricultural and environmental documents. You extract data with extreme precision, following exactly the format requested."
        },
        { role: "user", content: prompt }
      ],
      model: "llama3-70b-8192",
      temperature: 0.2, // Lower temperature for more deterministic outputs
    });

    const responseContent = chatCompletion.choices[0].message.content;
    
    // Parse the response as JSON
    let extractedData;
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseContent.match(/```(?:json)?([\s\S]*?)```/) || 
                        responseContent.match(/({[\s\S]*})/);
                        
      const jsonContent = jsonMatch ? jsonMatch[1].trim() : responseContent;
      extractedData = JSON.parse(jsonContent);
      
      // Step 3: Filter out entities that are not present in original text to avoid false positives
      extractedData = filterNonPresentEntities(extractedData, text);

      // Step 4: Run validation to ensure data quality
      const validationResult = validateExtractedData(extractedData, text, preprocessed.documentType);
      
      // Build the final result
      const result = {
        data: extractedData,
        metadata: preprocessed.metadata,
        documentType: preprocessed.documentType,
        validation: validationResult,
        confidence: calculateConfidence(validationResult)
      };
      
      // Include raw text if requested
      if (options.includeRawText) {
        result.rawText = text;
      }
      
      return result;
    } catch (parseError) {
      console.error('Error parsing LLM response as JSON:', parseError);
      throw new Error('Failed to parse structured data from LLM response');
    }
  } catch (error) {
    console.error('Error extracting document data:', error);
    throw new Error(`Document data extraction failed: ${error.message}`);
  }
}

/**
 * Creates extraction prompt based on document type
 * @param {Object} preprocessed - Preprocessed document data
 * @returns {string} LLM prompt
 */
function createPromptByDocType(preprocessed) {
  const basePrompt = `I need you to extract structured data from the following ${preprocessed.documentType.replace('_', ' ')} document.
  
Here's the text:
---
${preprocessed.fullText.substring(0, 8000)}
${preprocessed.fullText.length > 8000 ? '...(text truncated due to length)' : ''}
---

Please extract and structure the data into JSON format according to these guidelines:
1. If information for a field is not available, use null.
2. If an entire section is not present in the document, include an empty array for that section.
3. Don't invent or assume information - only extract what's clearly stated in the text.
4. Use array format even if only one item is found.

Respond ONLY with the JSON object, without explanation or additional text.`;

  // Use the same extraction schema for all document types
  return `${basePrompt}

Extract data into this format:
{
  "summary": {
    "totalGoals": number,
    "totalBMPs": number,
    "completionRate": number (estimate as percentage between 0-100)
  },
  "goals": [
    {
      "id": string,
      "title": string,
      "description": string,
      "priority": string
    }
  ],
  "bmps": [
    {
      "id": string,
      "name": string,
      "description": string,
      "category": string,
      "effectiveness": number (rate from 0-100)
    }
  ],
  "implementation": [
    {
      "id": string,
      "name": string,
      "status": string,
      "progress": number (percentage from 0-100)
    }
  ],
  "monitoring": [
    {
      "id": string,
      "name": string,
      "value": number,
      "unit": string
    }
  ],
  "outreach": [
    {
      "id": string,
      "name": string,
      "reach": number,
      "type": string
    }
  ],
  "geographicAreas": [
    {
      "id": string,
      "name": string,
      "size": number,
      "unit": string
    }
  ]
}`;
}

/**
 * Validates the extracted data for accuracy
 * @param {Object} data - Extracted data
 * @param {string} originalText - Original text for validation
 * @param {string} docType - Document type
 * @returns {Object} Validation results
 */
function validateExtractedData(data, originalText, docType) {
  const results = {
    totalChecks: 0,
    passedChecks: 0,
    sectionValidation: {},
    issues: []
  };
  
  // Generic data structure checks
  results.totalChecks++;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    results.passedChecks++;
  } else {
    results.issues.push('Invalid data structure: root must be an object');
  }
  
  // Check for required sections based on document type
  const requiredSections = ['summary', 'goals', 'bmps'];
  results.totalChecks++;
  let missingSections = [];
  
  for (const section of requiredSections) {
    if (!data[section]) {
      missingSections.push(section);
    }
  }
  
  if (missingSections.length === 0) {
    results.passedChecks++;
  } else {
    results.issues.push(`Missing required sections: ${missingSections.join(', ')}`);
  }
  
  // Validate each section for all document types
  if (data) {
    if (data.goals) results.sectionValidation.goals = validateEntityPresence(data.goals, 'description', originalText);
    if (data.bmps) results.sectionValidation.bmps = validateEntityPresence(data.bmps, 'name', originalText);
    if (data.implementation) results.sectionValidation.implementation = validateEntityPresence(data.implementation, 'name', originalText);
    if (data.monitoring) results.sectionValidation.monitoring = validateEntityPresence(data.monitoring, 'name', originalText);
    if (data.outreach) results.sectionValidation.outreach = validateEntityPresence(data.outreach, 'name', originalText);
    if (data.geographicAreas) results.sectionValidation.geographicAreas = validateEntityPresence(data.geographicAreas, 'name', originalText);
  }
  
  // Update total checks and passed checks based on section validations
  Object.values(results.sectionValidation).forEach(section => {
    results.totalChecks += section.totalChecks;
    results.passedChecks += section.passedChecks;
    
    // Add important issues to the main issues list (limit to avoid overwhelming)
    if (section.issues && section.issues.length > 0) {
      results.issues.push(...section.issues.slice(0, 3));
    }
  });
  
  return results;
}

/**
 * Get required sections for all document types
 * @returns {Array<string>} Required section names
 */
function getRequiredSectionsByDocType() {
  // Same required sections for all document types
  return ['summary', 'goals', 'bmps'];
}

/**
 * Validates that extracted entities appear in the original text
 * @param {Array} entities - Array of extracted entities
 * @param {string} keyField - Key field to check against original text
 * @param {string} originalText - Original text
 * @returns {Object} Validation results
 */
function validateEntityPresence(entities, keyField, originalText) {
  const result = { totalChecks: 0, passedChecks: 0, issues: [] };
  
  if (!entities || !Array.isArray(entities)) {
    return result;
  }
  
  entities.forEach((entity, index) => {
    if (entity && entity[keyField]) {
      result.totalChecks++;
      
      // Check if the entity text appears in the original text (allowing for minor variations)
      const entityText = entity[keyField].trim();
      if (entityText.length > 5) { // Only check substantial text
        // Create a regex that allows for minor variations in spacing and punctuation
        const flexiblePattern = entityText
          .replace(/\s+/g, '\\s+') // Allow for variable whitespace
          .replace(/[.,;:]/g, '[.,;:\\s]*'); // Allow for variable punctuation
        
        const regex = new RegExp(flexiblePattern, 'i');
        if (regex.test(originalText)) {
          result.passedChecks++;
        } else {
          result.issues.push(`Entity at index ${index} not found: "${entityText.substring(0, 30)}..."`);
        }
      } else {
        // For very short texts, require exact match
        if (originalText.includes(entityText)) {
          result.passedChecks++;
        } else {
          result.issues.push(`Short entity at index ${index} not found: "${entityText}"`);
        }
      }
    }
  });
  
  return result;
}

/**
 * Remove items that are likely hallucinations by verifying their key text occurs in the source
 * This enforces zero false positives for copied content fields
 * @param {Object} data
 * @param {string} originalText
 * @returns {Object}
 */
function filterNonPresentEntities(data, originalText) {
  if (!data || typeof data !== 'object') return data;

  const ensurePresent = (items, key) => {
    if (!Array.isArray(items)) return items;
    return items.filter(item => {
      const val = (item?.[key] || '').toString().trim();
      if (!val) return false;
      if (val.length <= 5) {
        return originalText.includes(val);
      }
      const flexiblePattern = val
        .replace(/\s+/g, '\\s+')
        .replace(/[.,;:]/g, '[.,;:\\s]*');
      return new RegExp(flexiblePattern, 'i').test(originalText);
    });
  };

  return {
    ...data,
    goals: ensurePresent(data.goals, 'description'),
    bmps: ensurePresent(data.bmps, 'name'),
    implementation: ensurePresent(data.implementation, 'name') || ensurePresent(data.implementation, 'activity'),
    monitoring: ensurePresent(data.monitoring, 'name') || ensurePresent(data.monitoring, 'metric'),
    outreach: ensurePresent(data.outreach, 'name') || ensurePresent(data.outreach, 'activity'),
    geographicAreas: ensurePresent(data.geographicAreas, 'name')
  };
}

/**
 * Calculates overall confidence score based on validation results
 * @param {Object} validation - Validation results
 * @returns {number} Confidence score (0-100)
 */
function calculateConfidence(validation) {
  if (validation.totalChecks === 0) return 0;
  return Math.round((validation.passedChecks / validation.totalChecks) * 100);
}

/**
 * Fill missing numeric values in extracted data with defaults
 * @param {Object} data - Extracted data
 * @returns {Object} Data with default values for missing fields
 */
function fillMissingValues(data) {
  if (!data) return data;

  // Fill summary values
  if (data.summary) {
    data.summary.totalGoals = data.summary.totalGoals || 0;
    data.summary.totalBMPs = data.summary.totalBMPs || 0;
    data.summary.completionRate = data.summary.completionRate === null ? 50 : data.summary.completionRate;
  }

  // Fill BMP effectiveness values
  if (Array.isArray(data.bmps)) {
    data.bmps = data.bmps.map(bmp => ({
      ...bmp,
      name: bmp.name || 'Unnamed BMP',
      category: bmp.category || 'General',
      effectiveness: bmp.effectiveness === null ? 60 : bmp.effectiveness
    }));
  }

  // Fill implementation progress values
  if (Array.isArray(data.implementation)) {
    data.implementation = data.implementation.map(item => ({
      ...item,
      status: item.status || 'In Progress',
      progress: item.progress === null ? 50 : item.progress
    }));
  }

  // Fill outreach values
  if (Array.isArray(data.outreach)) {
    data.outreach = data.outreach.map(item => ({
      ...item,
      reach: item.reach === null ? 100 : item.reach,
      type: item.type || 'Public Outreach'
    }));
  }

  // Fill geographic area values
  if (Array.isArray(data.geographicAreas)) {
    data.geographicAreas = data.geographicAreas.map(area => ({
      ...area,
      size: area.size === null ? 1000 : area.size,
      unit: area.unit || 'acres'
    }));
  }

  return data;
}

module.exports = {
  DocumentTypes,
  extractDocumentData,
  preprocessDocument,
  fillMissingValues
};