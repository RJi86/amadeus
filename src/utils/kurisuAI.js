async function getKurisuResponse(message) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
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
            - You're from the Steins;Gate worldline (1.048596%)`
          },
          { role: "user", content: message }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Groq API error:', data.error);
      return "I seem to be experiencing a temporal anomaly. Try again later.";
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "There seems to be an error in the system. How illogical...";
  }
}

module.exports = { getKurisuResponse };