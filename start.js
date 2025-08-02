#!/usr/bin/env node

/**
 * Coffee Shop Bot Startup Script
 * 
 * This script provides a more robust way to start the bot with
 * proper error handling and environment validation.
 */

const fs = require('fs');
const path = require('path');

function checkEnvironment() {
  console.log('🔍 Checking environment configuration...');
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('📝 Please create a .env file with your API keys.');
    console.log('💡 Use the env-template file as a reference.');
    process.exit(1);
  }
  
  // Load environment variables
  require('dotenv').config();
  
  // Check required environment variables
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'OPENAI_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('📝 Please add these to your .env file.');
    process.exit(1);
  }
  
  console.log('✅ Environment configuration looks good!');
  
  // Optional warnings
  if (!process.env.PINECONE_API_KEY) {
    console.log('⚠️  Pinecone API key not found - using mock inventory data');
  }
}

function startBot() {
  console.log('🚀 Starting Coffee Shop Bot...');
  console.log('📱 Make sure your bot is configured with @BotFather');
  console.log('💬 Users can find your bot and start chatting!');
  console.log('⏹️  Press Ctrl+C to stop the bot\n');
  
  // Start the main bot
  const CoffeeShopBot = require('./bot.js');
  const bot = new CoffeeShopBot();
  
  // Keep the process alive
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });
}

// Main execution
try {
  checkEnvironment();
  startBot();
} catch (error) {
  console.error('💥 Fatal error starting bot:', error.message);
  process.exit(1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Coffee Shop Bot...');
  console.log('👋 Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Bot terminated');
  process.exit(0);
});