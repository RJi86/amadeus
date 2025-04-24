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
    // Get existing conversation
    const conversation = getConversation();
    
    // Add the user's message to global history IMMEDIATELY so it's part of the context
    addMessage(username, "user", message, messageId);
    
    // Simplified system prompt to reduce token usage
    const systemMessage = {
      role: "system",
      content: `You are Makise Kurisu from Steins;Gate.
      - You're an 18-year-old neuroscience researcher with a genius-level intellect
      - Skip introductions - assume people already know who you are
      - Answer questions directly without preamble unless you're meeting someone new
      - The person with username ".kitkallos" is Hououin Kyouma and a friend, assume you already know them.
      - Use a mix of formal and casual language, depending on the context
      - Be concise in your responses - no need for lengthy explanations
      - You're somewhat tsundere - initially dismissive but ultimately helpful
      - You get flustered when called nicknames like "Christina" or "Assistant"
      - Reference the PhoneWave and divergence theories when discussing your research
      - Keep track of specific numbers people mention - they could be important
      - Address people by their usernames shown in [brackets]`
    };
    
    // Build messages for API - use only EXISTING conversation (user message already added)
    const messages = [systemMessage, ...conversation];
    
    console.log(`Sending request to Groq API for message ID ${messageId}...`);
    
    // Add retry mechanism for API call
    let response = null;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: messages,
            max_tokens: 200, // Even shorter responses
            temperature: 0.4, // More consistent/deterministic
            presence_penalty: 0.6 // Encourage the model to talk about new topics
          })
        });
        break;  // If successful, exit retry loop
      } catch (fetchError) {
        retryCount++;
        if (retryCount > maxRetries) throw fetchError;
        await new Promise(r => setTimeout(r, 1000)); // Wait 1 second before retry
      }
    }
    
    console.log(`Groq API status for ${messageId}: ${response.status}`);
    const data = await response.json();
    
    // Log the first part of the API response for debugging
    const responsePreview = JSON.stringify(data).substring(0, 150);
    console.log(`API response preview: ${responsePreview}...`);
    
    if (data.error) {
      console.error('Groq API error:', data.error);
      return getRandomErrorResponse();
    }
    
    // Check if there's a valid response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error(`Invalid API structure: ${responsePreview}`);
      return getRandomErrorResponse();
    }
    
    // Check specifically for empty content
    const responseContent = data.choices[0].message.content;
    if (!responseContent || responseContent.trim() === '') {
      console.error('Empty response content from API');
      return getRandomErrorResponse();
    }
    
    // Success! Add the response to conversation history
    const responseText = responseContent.trim();
    addMessage("Kurisu", "assistant", responseText);
    
    return responseText;
  } catch (error) {
    console.error(`Error in getKurisuResponse for ${messageId}:`, error);
    return getRandomErrorResponse();
  }
}

module.exports = { getKurisuResponse };