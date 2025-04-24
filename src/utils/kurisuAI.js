const { addMessage, getConversation } = require('./conversationMemory');

async function getKurisuResponse(message, username) {
  try {
    // Get existing conversation
    const conversation = getConversation();
    
    // Add the user's message to global history
    addMessage(username, "user", message);
    
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

    const data = await response.json();
    
    if (data.error) {
      console.error('Groq API error:', data.error);
      return "I seem to be experiencing a temporal anomaly. Try again later.";
    }
    
    // Check if there's a valid response
    const responseText = data.choices && 
                         data.choices[0] && 
                         data.choices[0].message && 
                         data.choices[0].message.content
                         ? data.choices[0].message.content
                         : "My neural pathways seem scrambled. Could you repeat that?";
    
    // Make sure response is not empty
    if (!responseText || responseText.trim() === '') {
      console.error('Empty response received from API');
      return "My neural pathways seem scrambled. Could you repeat that?";
    }
    
    // Add the AI's response to the conversation history
    addMessage("Kurisu", "assistant", responseText);
    
    return responseText;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "There seems to be an error in the system. How illogical...";
  }
}

module.exports = { getKurisuResponse };