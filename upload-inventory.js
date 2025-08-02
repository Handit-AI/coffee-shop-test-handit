#!/usr/bin/env node

/**
 * Upload Inventory to Pinecone
 * 
 * This script reads the inventory.csv file and uploads it to Pinecone
 * with proper embeddings for semantic search.
 */

const fs = require('fs');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const config = require('./config');

class InventoryUploader {
  constructor() {
    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
    
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    
    this.index = null;
  }

  async initialize() {
    try {
      console.log('🔌 Connecting to Pinecone...');
      this.index = this.pinecone.index(config.pinecone.indexName);
      console.log('✅ Connected to Pinecone successfully');
    } catch (error) {
      console.error('❌ Error connecting to Pinecone:', error);
      throw error;
    }
  }

  parseCsv(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const item = {};
      
      headers.forEach((header, index) => {
        let value = values[index];
        
        // Convert data types
        if (header === 'price') {
          value = parseFloat(value);
        } else if (header === 'stock') {
          value = parseInt(value);
        } else if (header === 'available') {
          value = value.toLowerCase() === 'true';
        }
        
        item[header] = value;
      });
      
      items.push(item);
    }
    
    return items;
  }

  async createEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  createSearchableText(item) {
    // Combine relevant fields for embedding
    return `${item.name} ${item.category} ${item.description}`.toLowerCase();
  }

  async uploadBatch(items, batchSize = 10) {
    console.log(`📦 Processing ${items.length} items in batches of ${batchSize}...`);
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(items.length/batchSize)}`);
      
      // Create embeddings for batch
      const vectors = [];
      
      for (const item of batch) {
        try {
          const searchableText = this.createSearchableText(item);
          const embedding = await this.createEmbedding(searchableText);
          
          vectors.push({
            id: item.id,
            values: embedding,
            metadata: {
              name: item.name,
              price: item.price,
              category: item.category,
              description: item.description,
              stock: item.stock,
              available: item.available,
              searchableText: searchableText
            }
          });
          
          console.log(`   ✅ ${item.name} - $${item.price}`);
          
          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`   ❌ Error processing ${item.name}:`, error.message);
        }
      }
      
      // Upload batch to Pinecone
      if (vectors.length > 0) {
        try {
          await this.index.upsert(vectors);
          console.log(`   📤 Uploaded batch to Pinecone`);
        } catch (error) {
          console.error(`   ❌ Error uploading batch:`, error.message);
        }
      }
      
      // Delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async uploadInventory() {
    try {
      console.log('📋 Reading inventory.csv...');
      
      // Read CSV file
      const csvContent = fs.readFileSync('inventory.csv', 'utf-8');
      const items = this.parseCsv(csvContent);
      
      console.log(`📊 Found ${items.length} items in inventory`);
      console.log('📝 Sample items:');
      items.slice(0, 3).forEach(item => {
        console.log(`   - ${item.name} (${item.category}): $${item.price}`);
      });
      console.log('');
      
      // Initialize Pinecone connection
      await this.initialize();
      
      // Upload in batches
      await this.uploadBatch(items);
      
      console.log('🎉 Inventory upload completed successfully!');
      console.log('🤖 Your bot can now search the Pinecone inventory');
      
    } catch (error) {
      console.error('💥 Error uploading inventory:', error);
      process.exit(1);
    }
  }

  async testSearch(query = 'coffee') {
    try {
      console.log(`\n🔍 Testing search with query: "${query}"`);
      
      // Create embedding for search query
      const queryEmbedding = await this.createEmbedding(query);
      
      // Search Pinecone
      const searchResults = await this.index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
        includeValues: false,
      });
      
      console.log('🎯 Search Results:');
      searchResults.matches.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.metadata.name} - $${match.metadata.price} (Score: ${match.score.toFixed(3)})`);
      });
      
    } catch (error) {
      console.error('❌ Error testing search:', error);
    }
  }
}

// Command line interface
async function main() {
  console.log('🏪 Coffee Shop Inventory Uploader\n');
  
  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    console.error('❌ .env file not found!');
    console.log('📝 Please create a .env file with your API keys.');
    process.exit(1);
  }
  
  // Check required environment variables
  if (!config.pinecone.apiKey) {
    console.error('❌ PINECONE_API_KEY not found in .env file');
    process.exit(1);
  }
  
  if (!config.openai.apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }
  
  const uploader = new InventoryUploader();
  
  const command = process.argv[2];
  
  if (command === 'test') {
    await uploader.initialize();
    await uploader.testSearch('latte');
  } else {
    await uploader.uploadInventory();
    
    // Test the upload
    console.log('\n🧪 Testing uploaded data...');
    await uploader.testSearch('espresso');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = InventoryUploader;