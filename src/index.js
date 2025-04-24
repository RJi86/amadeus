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
  
  // AI chat functionality - triggered by mention or starting with "Kurisu"
  if (message.mentions.has(client.user) || message.content.toLowerCase().startsWith('kurisu')) {
    // Extract the actual message without the mention or "Kurisu" prefix
    let userMessage = message.content;
    if (message.mentions.has(client.user)) {
      userMessage = userMessage.replace(/<@!?\d+>/, '').trim();
    } else if (message.content.toLowerCase().startsWith('kurisu')) {
      userMessage = userMessage.substring(6).trim();
