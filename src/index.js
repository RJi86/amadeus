const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Debug logs
console.log('Starting bot...');
console.log('Token loaded:', process.env.TOKEN ? 'Yes' : 'No');

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds] 
});

// Debug activity
console.log('Client created');

// Simple ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('Amadeus System is now online.');
  // Remove this line: process.exit(0);
});

// Simple message handler
client.on('messageCreate', message => {
  if (message.author.bot) return;
  
  if (message.content === '!ping') {
    message.channel.send('Pong!');
  }
  
  if (message.content === '!help') {
    message.channel.send('Available commands:\n!ping - Responds with Pong!\n!help - Shows this message');
  }
});

// Set a timeout to detect stalling
setTimeout(() => {
  console.log('Still waiting for connection after 10 seconds...');
}, 10000);

// Login with error handling
console.log('Attempting to log in...');
client.login(process.env.TOKEN)
  .then(() => console.log('Login promise resolved'))
  .catch(err => {
    console.error('Login failed with error:', err);
    process.exit(1);
  });

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

// Log any unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});