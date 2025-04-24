// Global conversation memory system
const globalConversation = [];
const MAX_HISTORY_LENGTH = 10; // Reduced from 20 to 10 as requested
const messageMap = new Map(); // Tracks which user message goes with which response

function addMessage(username, role, content, messageId = null) {
  // Format message with username for context
  let formattedContent = content;
  
  // If it's a user message, prefix with username and store the message ID
  if (role === "user") {
    formattedContent = `[${username}]: ${content}`;
    if (messageId) {
      messageMap.set(messageId, globalConversation.length); // Track position in conversation
    }
  }
  
  globalConversation.push({ role, content: formattedContent });
  
  // Keep only the most recent messages
  if (globalConversation.length > MAX_HISTORY_LENGTH) {
    globalConversation.shift(); // Remove oldest message
  }
  
  return [...globalConversation];
}

function getConversation() {
  return [...globalConversation]; // Return copy to prevent modification
}

// Clear entire conversation history
function clearConversation() {
  globalConversation.length = 0;
  console.log("D-Mail sent to the past. Conversation history altered.");
}

module.exports = { addMessage, getConversation, clearConversation, messageMap };