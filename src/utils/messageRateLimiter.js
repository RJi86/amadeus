const processedMessages = new Set();
const processingMessages = new Set(); // Track messages currently being processed

/**
 * Checks if a message has been recently processed to prevent duplicates
 * @param {string} id - The message ID to check
 * @returns {boolean} - True if the message should be processed, false otherwise
 */
function shouldProcessMessage(id) {
  // Already processed or currently processing this message
  if (processedMessages.has(id) || processingMessages.has(id)) {
    console.log(`Skipping duplicate processing of message: ${id}`);
    return false;
  }
  
  // Mark as being processed
  processingMessages.add(id);
  
  // After processing completes, move to processed set
  setTimeout(() => {
    processingMessages.delete(id);
    processedMessages.add(id);
    
    // Clean up older processed messages later
    setTimeout(() => {
      processedMessages.delete(id);
    }, 30000); // 30 seconds retention of processed IDs
  }, 100);
  
  return true;
}

module.exports = { shouldProcessMessage };