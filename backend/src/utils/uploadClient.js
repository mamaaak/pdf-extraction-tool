/**
 * Example client for the PDF upload API
 * 
 * This file demonstrates how to use the /api/pdf/upload endpoint to extract raw text from PDFs.
 * It's provided as a reference implementation.
 */
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

/**
 * Extracts text from a PDF file using the /api/pdf/upload endpoint
 * @param {string} apiUrl - The API base URL
 * @param {string} pdfFilePath - Path to the PDF file to upload
 * @returns {Promise<Object>} - Response containing the extracted text and metadata
 */
async function extractTextFromPdf(apiUrl, pdfFilePath) {
  try {
    // Validate the file exists
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error(`File not found: ${pdfFilePath}`);
    }

    // Create form data with the PDF file
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(pdfFilePath));

    // Set headers with the form's boundary
    const headers = {
      ...formData.getHeaders(),
      'Content-Length': formData.getLengthSync()
    };

    // Make the API call
    console.log(`Uploading ${pdfFilePath} to ${apiUrl}/api/pdf/upload...`);
    const response = await axios.post(`${apiUrl}/api/pdf/upload`, formData, { headers });

    // Return the response data
    return response.data;
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with an error status
      console.error('API error:', error.response.data);
      throw new Error(`API error: ${error.response.data.error || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from API');
      throw new Error('No response received from API');
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
      throw error;
    }
  }
}

// Example usage (uncomment to test)
/*
(async () => {
  try {
    const apiUrl = 'http://localhost:5000';
    const pdfPath = path.join(__dirname, '../../../sample.pdf');
    
    const result = await extractTextFromPdf(apiUrl, pdfPath);
    
    console.log('Extraction successful!');
    console.log('Metadata:', result.metadata);
    console.log('First 100 characters of text:', result.text.substring(0, 100) + '...');
    
    // Save the extracted text to a file
    const outputPath = path.join(__dirname, '../../../extracted-text.txt');
    fs.writeFileSync(outputPath, result.text);
    console.log(`Full text saved to ${outputPath}`);
  } catch (error) {
    console.error('Failed to extract text:', error.message);
  }
})();
*/

module.exports = { extractTextFromPdf };