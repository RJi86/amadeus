const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const http = require('http');
const { getKurisuResponse } = require('./utils/kurisuAI');

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
  if (message.author.bot) return;
  
  // Command handling
  if (message.content === '!ping') {
    message.channel.send('Pong!');
  }
  
  if (message.content === '!help') {
    message.channel.send('Available commands:\n!ping - Tests response time\n!help - Shows this message\n\nYou can also mention me or start your message with "Kurisu" to chat with me.');
  }

  if (message.content === '!dmail') {
    const { clearConversation } = require('./utils/conversationMemory');
    clearConversation();
    message.channel.send("D-Mail sent to the past. The timeline has been altered. El Psy Kongroo.");
  }
  
  // AI chat functionality - triggered by mention or starting with "Kurisu"
  if (message.mentions.has(client.user) || message.content.toLowerCase().startsWith('kurisu')) {
    // Extract the actual message without the mention or "Kurisu" prefix
    let userMessage = message.content;
    if (message.mentions.has(client.user)) {
      userMessage = userMessage.replace(/<@!?\d+>/, '').trim();
    } else if (message.content.toLowerCase().startsWith('kurisu')) {
      userMessage = userMessage.substring(6).trim();
    }
    
    // Send typing indicator
    message.channel.sendTyping();
    
    // Show thinking message for immersion
    const thinkingMessage = await message.channel.send("*Thinking...*");
    
    try {
      // Get AI response - pass username for context
      const response = await getKurisuResponse(userMessage, message.author.username);
      
      // Make sure we never send an empty message
      const safeResponse = response && response.trim() 
        ? response 
        : "My neural pathways seem scrambled. Could you repeat that?";
      
      // Delete thinking message and send response
      await thinkingMessage.delete();
      message.channel.send(safeResponse);
    } catch (error) {
      console.error('Error in AI response:', error);
      await thinkingMessage.delete();
      message.channel.send("I apologize, but there seems to be an error in my neural network. How troublesome...");
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