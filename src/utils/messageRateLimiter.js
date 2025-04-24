const processedMessages = new Set();

/**
 * Checks if a message has been recently processed to prevent duplicates
 * @param {string} id - The message ID to check
 * @returns {boolean} - True if the message should be processed, false otherwise
 */
function shouldProcessMessage(id) {
  // Already processed this message recently
  if (processedMessages.has(id)) {
    console.log(`Skipping duplicate processing of message: ${id}`);
    return false;
  }
  
  // Mark as processed and schedule cleanup
  processedMessages.add(id);
  setTimeout(() => {
    processedMessages.delete(id);
  }, 10000); // 10 seconds timeout
  
  return true;
}

module.exports = { shouldProcessMessage };