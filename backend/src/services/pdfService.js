const pdfParse = require('pdf-parse');
const fs = require('fs');
const { Groq } = require('groq-sdk');
const { chunkText } = require('../utils/textUtils');

/**
 * Extracts text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(filePath) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Analyzes extracted text using Groq LLM
 * @param {string} text - Extracted text to analyze
 * @returns {Promise<object>} - Analysis results
 */
async function analyzeWithGroq(text) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    const groq = new Groq({
      apiKey,
    });

    // Handle large documents by chunking if necessary
    const chunks = chunkText(text, 8000); // Limit to 8k characters per chunk
    const firstChunk = chunks[0];

    const prompt = `Analyze the following document text and extract key information:
    
    ${firstChunk}
    
    ${chunks.length > 1 ? '(Note: This is only part of the document due to length limitations)' : ''}
    
    Extract and structure the following information in a JSON format:
    1. mainTopics: Array of main topics covered in the document (3-5 items)
    2. keyEntities: Object mapping important entities (people, organizations, technologies) to their frequency or importance score
    3. importantDates: Array of important dates and numerical facts mentioned
    4. findings: A concise summary of core findings or conclusions (1-3 paragraphs)
    
    Respond ONLY with a valid JSON object containing these fields.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a document analysis expert that extracts structured information from texts. Always respond with valid JSON."
        },
        { role: "user", content: prompt }
      ],
      model: "llama3-70b-8192",
    });

    const responseContent = chatCompletion.choices[0].message.content;
    
    // Parse the response as JSON
    let jsonResponse;
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseContent.match(/```(?:json)?([\s\S]*?)```/) || 
                        responseContent.match(/({[\s\S]*})/);
                        
      const jsonContent = jsonMatch ? jsonMatch[1].trim() : responseContent;
      jsonResponse = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing LLM response as JSON:', parseError);
      // Fallback to sending the raw response with a flag
      return {
        rawText: responseContent,
        parsingError: true
      };
    }

    return jsonResponse;
  } catch (error) {
    console.error('Error in Groq LLM analysis:', error);
    throw new Error('Failed to analyze text with LLM: ' + error.message);
  }
}

module.exports = {
  extractTextFromPDF,
  analyzeWithGroq
};