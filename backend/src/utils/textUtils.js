/**
 * Splits text into manageable chunks for LLM processing
 * @param {string} text - Text to chunk
 * @param {number} maxChunkSize - Maximum characters per chunk
 * @returns {Array<string>} - Array of text chunks
 */
function chunkText(text, maxChunkSize = 8000) {
  if (!text || text.length <= maxChunkSize) {
    return [text];
  }
  
  const chunks = [];
  let currentChunk = "";
  
  // Split by paragraphs first for more natural chunking
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed max size, save current chunk and start a new one
    if (currentChunk.length + paragraph.length + 2 > maxChunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }
      
      // If a single paragraph is too big, split it further
      if (paragraph.length > maxChunkSize) {
        const sentencesChunks = chunkBySentences(paragraph, maxChunkSize);
        chunks.push(...sentencesChunks);
        currentChunk = "";
      } else {
        currentChunk = paragraph;
      }
    } else {
      // Add paragraph separator if needed
      if (currentChunk.length > 0) {
        currentChunk += "\n\n";
      }
      currentChunk += paragraph;
    }
  }
  
  // Add the final chunk if it has content
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Splits text by sentences when paragraphs are too large
 * @param {string} text - Text to chunk by sentences
 * @param {number} maxChunkSize - Maximum characters per chunk
 * @returns {Array<string>} - Array of text chunks
 */
function chunkBySentences(text, maxChunkSize) {
  // Basic sentence splitting (not perfect but functional)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  const chunks = [];
  let currentChunk = "";
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed max size, save current chunk and start a new one
    if (currentChunk.length + sentence.length > maxChunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }
      
      // If a single sentence is too big (rare), split it by character
      if (sentence.length > maxChunkSize) {
        let remaining = sentence;
        while (remaining.length > 0) {
          chunks.push(remaining.slice(0, maxChunkSize));
          remaining = remaining.slice(maxChunkSize);
        }
        currentChunk = "";
      } else {
        currentChunk = sentence;
      }
    } else {
      // Add space between sentences if needed
      if (currentChunk.length > 0 && !currentChunk.endsWith(" ")) {
        currentChunk += " ";
      }
      currentChunk += sentence;
    }
  }
  
  // Add the final chunk if it has content
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

module.exports = {
  chunkText
};