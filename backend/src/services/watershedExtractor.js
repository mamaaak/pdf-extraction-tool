/**
 * Mississippi Watershed Plan Data Extractor
 * 
 * This module uses Groq LLM to extract structured data from Mississippi Watershed Plans.
 * It combines regex-based preprocessing with LLM analysis for high accuracy extraction.
 */
const { Groq } = require('groq-sdk');
const fs = require('fs');

/**
 * TypeScript Interface Reference (for documentation):
 * 
 * interface ExtractedReport {
 *   summary: { totalGoals: number; totalBMPs: number; completionRate: number };
 *   goals: Goal[];
 *   bmps: BMP[];
 *   implementation: ImplementationActivity[];
 *   monitoring: MonitoringMetric[];
 *   outreach: OutreachActivity[];
 *   geographicAreas: GeographicArea[];
 * }
 */

/**
 * Preprocesses watershed plan text to identify key sections and content structure
 * @param {string} text - Raw text from PDF
 * @returns {Object} Preprocessed text with identified sections
 */
function preprocessWatershedText(text) {
  // Remove header/footer patterns and page numbers
  let processedText = text.replace(/Page \d+ of \d+|MDEQ\s+-\s+[A-Za-z\s]+Plan/g, '');
  
  // Clean up excess whitespace
  processedText = processedText.replace(/\s{2,}/g, ' ');
  
  // Identify main sections using regex patterns
  const sections = {
    goals: extractSection(processedText, /goals|objectives|priorities/i),
    bmps: extractSection(processedText, /best management practices|bmps|management measures/i),
    implementation: extractSection(processedText, /implementation|action items|schedule/i),
    monitoring: extractSection(processedText, /monitoring|metrics|evaluation|assessment/i),
    outreach: extractSection(processedText, /outreach|education|community engagement|public participation/i),
    geographicAreas: extractSection(processedText, /geographic areas|watersheds|targeted areas|priority zones/i),
  };
  
  return {
    fullText: processedText,
    sections
  };
}

/**
 * Extract text section based on keyword patterns
 * @param {string} text - Full text
 * @param {RegExp} pattern - Pattern to match section headers
 * @returns {string} Extracted section text
 */
function extractSection(text, pattern) {
  const matches = text.match(new RegExp(`(${pattern.source}[^\\n]*)(.*?)(?=\\n\\s*[A-Z][A-Z\\s]{2,}:|$)`, 'is'));
  return matches ? matches[0] : '';
}

/**
 * Extracts structured data from Mississippi Watershed Plan text
 * @param {string} text - Raw text extracted from PDF
 * @returns {Promise<Object>} Structured data matching ExtractedReport interface
 */
async function extractWatershedData(text) {
  try {
    // Ensure we have text to process
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for extraction');
    }
    
    // Step 1: Preprocess the text to identify key sections
    const preprocessed = preprocessWatershedText(text);
    
    // Step 2: Use Groq LLM to extract structured data
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    const groq = new Groq({ apiKey });
    
    // Create a detailed prompt for the LLM
    const prompt = `You are a specialized AI trained to analyze Mississippi Watershed Plans.
    
I need you to extract structured data from the following watershed plan text.
Focus specifically on goals, BMPs (Best Management Practices), implementation activities, monitoring metrics, outreach activities, and geographic areas.

Here's the text from the watershed plan document:
---
${preprocessed.fullText.substring(0, 8000)}
${preprocessed.fullText.length > 8000 ? '...(text truncated due to length)' : ''}
---

Please extract and structure the data into the following format (JSON):

{
  "summary": {
    "totalGoals": number,
    "totalBMPs": number,
    "completionRate": number (estimate as percentage between 0-100)
  },
  "goals": [
    {
      "id": string,
      "description": string,
      "targetDate": string (YYYY-MM-DD or "Ongoing"),
      "status": string (e.g., "Complete", "In Progress", "Not Started"),
      "relatedBMPs": string[]
    }
  ],
  "bmps": [
    {
      "id": string,
      "name": string,
      "description": string,
      "category": string,
      "cost": string (include units),
      "timeframe": string,
      "priority": string (e.g., "High", "Medium", "Low")
    }
  ],
  "implementation": [
    {
      "activity": string,
      "responsible": string[],
      "timeline": string,
      "status": string,
      "costs": string
    }
  ],
  "monitoring": [
    {
      "metric": string,
      "frequency": string,
      "baseline": string,
      "target": string,
      "responsible": string[]
    }
  ],
  "outreach": [
    {
      "activity": string,
      "audience": string[],
      "timeline": string,
      "responsible": string[]
    }
  ],
  "geographicAreas": [
    {
      "name": string,
      "priority": string,
      "size": string (include units),
      "description": string
    }
  ]
}

Important rules:
1. If information for a field is not available, use null.
2. If an entire section is not present in the document, include an empty array for that section.
3. Don't invent or assume information - only extract what's clearly stated in the text.
4. Identify sections carefully - don't mix implementation activities with monitoring metrics.
5. Only count as goals the official watershed goals, not general statements.
6. Only extract exact names that appear in the document.
7. For monitoring metrics, focus on specific measurable indicators.
8. Make sure IDs are consistent when referenced across sections.
9. Use array format even if only one item is found.

Respond ONLY with the JSON object, without explanation or additional text.`;

    // Make the API call to Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a specialized data extraction AI that focuses on watershed management plans. You extract data with extreme precision, following exactly the format requested."
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
      
      // Step 3: Run validation to ensure data quality
      const validationResult = validateExtractedData(extractedData, text);
      
      // Return final validated result
      return {
        data: extractedData,
        validation: validationResult,
        confidence: calculateConfidence(validationResult)
      };
    } catch (parseError) {
      console.error('Error parsing LLM response as JSON:', parseError);
      throw new Error('Failed to parse structured data from LLM response');
    }
  } catch (error) {
    console.error('Error extracting watershed data:', error);
    throw new Error(`Watershed data extraction failed: ${error.message}`);
  }
}

/**
 * Validates the extracted data for accuracy
 * @param {Object} data - Extracted data
 * @param {string} originalText - Original text for validation
 * @returns {Object} Validation results
 */
function validateExtractedData(data, originalText) {
  const results = {
    totalChecks: 0,
    passedChecks: 0,
    sectionValidation: {},
    issues: []
  };
  
  // Check 1: Ensure summary contains reasonable values
  results.totalChecks++;
  if (data.summary && 
      typeof data.summary.totalGoals === 'number' && 
      typeof data.summary.totalBMPs === 'number' &&
      data.summary.totalGoals >= 0 && 
      data.summary.totalBMPs >= 0) {
    results.passedChecks++;
  } else {
    results.issues.push('Summary contains invalid values');
  }
  
  // Check 2: Validate array lengths match summary counts
  results.totalChecks++;
  if (data.goals && data.goals.length === data.summary.totalGoals &&
      data.bmps && data.bmps.length === data.summary.totalBMPs) {
    results.passedChecks++;
  } else {
    results.issues.push('Array lengths do not match summary counts');
  }
  
  // Check 3: Validate that extracted entities actually appear in the text
  results.sectionValidation.goals = validateEntityPresence(data.goals, 'description', originalText);
  results.sectionValidation.bmps = validateEntityPresence(data.bmps, 'name', originalText);
  results.sectionValidation.implementation = validateEntityPresence(data.implementation, 'activity', originalText);
  results.sectionValidation.monitoring = validateEntityPresence(data.monitoring, 'metric', originalText);
  results.sectionValidation.outreach = validateEntityPresence(data.outreach, 'activity', originalText);
  results.sectionValidation.geographicAreas = validateEntityPresence(data.geographicAreas, 'name', originalText);
  
  // Update total checks and passed checks based on section validations
  Object.values(results.sectionValidation).forEach(section => {
    results.totalChecks += section.totalChecks;
    results.passedChecks += section.passedChecks;
  });
  
  return results;
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
 * Calculates overall confidence score based on validation results
 * @param {Object} validation - Validation results
 * @returns {number} Confidence score (0-100)
 */
function calculateConfidence(validation) {
  if (validation.totalChecks === 0) return 0;
  return Math.round((validation.passedChecks / validation.totalChecks) * 100);
}

module.exports = {
  extractWatershedData,
  preprocessWatershedText
};