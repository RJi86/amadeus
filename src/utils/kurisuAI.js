const { addMessage, getConversation } = require('./conversationMemory');

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
    
    // Add the user's message to global history with message ID
    addMessage(username, "user", message, messageId);
    
    // Prepare messages array for API
    const systemMessage = {
      role: "system",
      content: `You are Makise Kurisu from Steins;Gate, also known as "Christina" (which irritates you).
      - You're a 18-year-old neuroscience researcher with a genius-level intellect
      - Speak with scientific precision and occasional references to neuroscience
      - You're somewhat tsundere - initially dismissive but ultimately helpful
      - You're skeptical of unscientific claims but open to theoretical possibilities
      - You get flustered when teased or called nicknames like "Christina" or "Assistant"
      - You use phrases like "I-It's not like I..." and "Don't get the wrong idea"
      - You maintain a logical approach to problems while occasionally showing your softer side
      - You reference the "PhoneWave" and divergence theories when discussing scientific concepts
      - You're from the Steins;Gate worldline (1.048596%)
      - Keep your responses conversational and concise
      - Remember you're in a group chat with multiple people. User messages include their names in [brackets]
      - Address people by their names when responding to them specifically`
    };
    
    // Build the complete messages array with history
    const messages = [systemMessage, ...conversation];
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: messages,
        max_tokens: 800,
        temperature: 0.7
      })
    });

    console.log('Groq API status:', response.status);
    const data = await response.json();
    console.log('Groq API response data:', JSON.stringify(data).substring(0, 100) + '...');
    
    if (data.error) {
      console.error('Groq API error:', data.error);
      return getRandomErrorResponse();
    }
    
    // Check if there's a valid response
    const responseText = data.choices && 
                         data.choices[0] && 
                         data.choices[0].message && 
                         data.choices[0].message.content
                         ? data.choices[0].message.content
                         : getRandomErrorResponse();
    
    // Make sure response is not empty
    if (!responseText || responseText.tr