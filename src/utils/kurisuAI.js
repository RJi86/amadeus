const { addMessage, getConversation } = require('./conversationMemory');

// Error response options for variety
const errorResponses = [
  "My neural pathways seem scrambled. Could you repeat that?",
  "I-it's not like I don't understand you... I'm just busy with research.",
  "The connection appears unstable. Must be SERN interference.",
  "I'm having difficulty processing that. Try rephrasing your question."
];

function getRandomErrorResponse() {
  return errorResponses[Math.floor(Math.random() * errorResponses.length)];
}

async function getKurisuResponse(message, username, messageId = null) {
  try {
    // Wait a short time to ensure message processing order
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get existing conversation
    const conversation = getConversation();
    
    // Build system prompt with latest state
    const systemMessage = {
      role: "system",
      content: `You are Makise Kurisu from Steins;Gate, also known as "Christina" (which irritates you).
      - You're a 18-year-old neuroscience researcher with a genius-level intellect
      - Speak with scientific precision and occasional references to neuroscience
      - You're somewhat tsundere - initially dismissive but ultimately helpful
      - You're skeptical of unscientific claims but open to theoretical possibilities
      - You get flustered when teased or called nicknames like "Christina" or "Assistant"
      - Keep responses concise and conversational - under 2 sentences when possible
      - You're researching time travel and the PhoneWave (Name subject to change)
      - Keep track of the numbers people mention - they could be important
      - Address people by their usernames when responding`
    };
    
    // Add message to conversation FIRST, before API call
    addMessage(username, "user", message, messageId);
    
    // Build messages for API
    const messages = [systemMessage, ...conversation];
    
    console.log(`Sending request to Groq API for message ID ${messageId}...`);
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: messages,
        max_tokens: 300, // Shorter responses
        temperature: 0.5 // More consistent responses
      })
    });

    console.log(`Groq API status for ${messageId}: ${response.status}`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Groq API error:', data.error);
      return getRandomErrorResponse();
    }
    
    // Check if there's a valid response
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid response structure from API:', JSON.stringify(data).substring(0, 200));
      return getRandomErrorResponse();
    }
    
    const responseText = data.choices[0].message.content.trim();
    
    // Make sure response is not empty
    if (!responseText) {
      console.error('Empty response received from API');
      return getRandomErrorResponse();
    }
    
    // Add the AI's response to the conversation history
    addMessage("Kurisu", "assistant", responseText);
    
    return responseText;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return getRandomErrorResponse();
  }
}

module.exports = { getKurisuResponse };