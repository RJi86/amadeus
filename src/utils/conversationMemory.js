// Global conversation memory system
const globalConversation = [];
const MAX_HISTORY_LENGTH = 20; // Store last 20 messages

function addMessage(username, role, content) {
  // Format message with username for context
  let formattedContent = content;
  
  // If it's a user message, prefix with username
  if (role === "user") {
    formattedContent = `[${username}]: ${content}`;
  }
  
  globalConversation.push({ role, content: formattedContent });
  
  // Keep only the most recent messages
  if (globalConversation.length > MAX_HISTORY_LENGTH) {
    globalConversation.shift(); // Remove oldest message
  }
  
  return [...globalConversation]; // Return copy of conversation
}

function getConversation() {
  return [...globalConversation]; // Return copy to prevent modification
}

// Clear entire conversation history (D-Mail functionality)
function clearConversation() {
  globalConversation.length = 0;
  console.log("D-Mail sent to the past. Conversation history altered.");
}

module.exports = { addMessage, getConversation, clearConversation };