const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const http = require('http');
const { getKurisuResponse } = require('./utils/kurisuAI');
const { shouldProcessMessage } = require('./utils/messageRateLimiter');

// Add this after your other imports
const THINKING_MESSAGES = new Map();

// Function to handle message timeouts
function handleMessageTimeout(messageId) {
  const thinkingMessage = THINKING_MESSAGES.get(messageId);
  if (thinkingMessage) {
    console.log(`Message ${messageId} timed out. Cleaning up thinking message.`);
    thinkingMessage.delete().catch(err => {
      console.error('Failed to delete timed-out thinking message:', err);
    });
    THINKING_MESSAGES.delete(messageId);
  }
}

// Debug logs
console.log('Starting bot...');
console.log('Token loaded:', process.env.TOKEN ? 'Yes' : 'No');
console.log('Groq API Key loaded:', process.env.GROQ_API_KEY ? 'Yes' : 'No');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

// Debug activity
console.log('Client created');

// Simple ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('Amadeus System is now online.');
  client.user.setActivity('with the PhoneWave');
});

// Message handler with AI integration
client.on('messageCreate', async message => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Use our improved message debouncer
  if (!shouldProcessMessage(message.id)) return;
  
  // Command handling
  if (message.content === '!ping') {
    return message.channel.send('Pong!');
  }
  
  if (message.content === '!help') {
    return message.channel.send('Available commands:\n!ping - Tests response time\n!help - Shows this message\n\nYou can also mention me or start your message with "Kurisu" to chat with me.');
  }

  if (message.content === '!dmail') {
    const { clearConversation } = require('./utils/conversationMemory');
    clearConversation();
    return message.channel.send("D-Mail sent to the past. The timeline has been altered. El Psy Kongroo.");
  }

  if (message.content === '!test') {
    message.channel.send("Testing Groq API connection...");
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
            { role: "system", content: "You are Kurisu. Respond with 'El Psy Kongroo.'" },
            { role: "user", content: "Test message" }
          ],
          max_tokens: 10,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      message.channel.send(`API Test Result: ${JSON.stringify(data, null, 2).substring(0, 1000)}`);
    } catch (error) {
      message.channel.send(`API Test Error: ${error.message}`);
    }
    return;
  }
  
  // AI chat functionality 
  if (message.mentions.has(client.user) || message.content.toLowerCase().startsWith('kurisu')) {
    // Extract message content
    let userMessage = message.content;
    
    // Log incoming message
    console.log(`[${message.id}] Message from ${message.author.username}: "${userMessage}"`);
    
    if (message.mentions.has(client.user)) {
      userMessage = userMessage.replace(/<@!?\d+>/, '').trim();
    } else if (message.content.toLowerCase().startsWith('kurisu')) {
      userMessage = userMessage.substring(6).trim();
    }
    
    message.channel.sendTyping();
    const thinkingMessage = await message.channel.send("*Thinking...*");
    
    // Store thinking message for timeout handling
    THINKING_MESSAGES.set(message.id, thinkingMessage);
    
    // Add message timeout
    const timeoutId = setTimeout(() => {
      handleMessageTimeout(message.id);
    }, 15000);  // 15 second timeout
    
    try {
      const timestamp = new Date().getTime();
      console.log(`[${message.id}] Processing at ${timestamp}`);
      
      const response = await getKurisuResponse(userMessage, message.author.username, message.id);
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      THINKING_MESSAGES.delete(message.id);
      
      // Make sure response exists
      const safeResponse = response && response.trim() 
        ? response 
        : "I seem to be having connection issues. Must be SERN interference.";
      
      // Delete thinking message only if it wasn't already deleted by timeout
      await thinkingMessage.delete().catch(() => {
        console.log(`Thinking message for ${message.id} was already deleted`);
      });
      
      return message.channel.send(safeResponse);
    } catch (error) {
      // Clear timeout
      clearTimeout(timeoutId);
      THINKING_MESSAGES.delete(message.id);
      
      console.error(`[${message.id}] Error in AI response:`, error);
      await thinkingMessage.delete().catch(() => {});
      return message.channel.send("I apologize, but there seems to be an error in my neural network. How troublesome...");
    }
  }
});

// Login with error handling
client.login(process.env.TOKEN)
  .then(() => console.log('Login successful'))
  .catch(err => {
    console.error('Login failed with error:', err);
    process.exit(1);
  });

// HTTP server for hosting
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Amadeus System is running! El Psy Kongroo.');
});

server.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});