#!/usr/bin/env node

/**
 * Test Script for Coffee Shop Bot
 * 
 * This script helps verify that all services are working correctly
 * before starting the bot.
 */

const config = require('./config');
const PineconeService = require('./services/pinecone');
const OpenAIService = require('./services/openai');

async function testConfiguration() {
  console.log('🧪 Testing Coffee Shop Bot Configuration...\n');
  
  // Test 1: Configuration
  console.log('1️⃣ Testing Configuration...');
  if (config.telegram.token) {
    console.log('✅ Telegram bot token found');
  } else {
    console.log('❌ Telegram bot token missing');
  }
  
  if (config.openai.apiKey) {
    console.log('✅ OpenAI API key found');
  } else {
    console.log('❌ OpenAI API key missing');
  }
  
  if (config.pinecone.apiKey) {
    console.log('✅ Pinecone API key found');
  } else {
    console.log('⚠️  Pinecone API key missing (will use mock data)');
  }
  
  console.log('');
}

async function testPinecone() {
  console.log('2️⃣ Testing Pinecone Service...');
  try {
    const pineconeService = new PineconeService();
    const inventory = await pineconeService.getInventory('coffee');
    console.log(`✅ Pinecone service working - found ${inventory.length} items`);
    console.log('📝 Sample items:');
    inventory.slice(0, 3).forEach(item => {
      console.log(`   - ${item.name}: $${item.price}`);
    });
  } catch (error) {
    console.log('⚠️  Pinecone service using fallback data:', error.message);
  }
  console.log('');
}

async function testOpenAI() {
  console.log('3️⃣ Testing OpenAI Service...');
  try {
    const openaiService = new OpenAIService();
    const mockInventory = [
      { name: 'Test Coffee', price: 3.50, category: 'Coffee', description: 'A test item', available: true }
    ];
    
    const response = await openaiService.generateResponse('I want coffee', mockInventory);
    console.log('✅ OpenAI service working');
    console.log('📝 Sample response:', response.substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ OpenAI service error:', error.message);
  }
  console.log('');
}

async function runTests() {
  try {
    await testConfiguration();
    await testPinecone();
    await testOpenAI();
    
    console.log('🎉 Testing complete!');
    console.log('🚀 You can now start your bot with: npm start');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };