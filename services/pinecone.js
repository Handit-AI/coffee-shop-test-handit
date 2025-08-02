const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const config = require('../config');
const { trackNode } = require('@handit.ai/node');

class PineconeService {
  constructor() {
    this.client = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.index = null;
  }

  async initialize() {
    try {
      this.index = this.client.index(config.pinecone.indexName);
      console.log('Pinecone initialized successfully');
    } catch (error) {
      console.error('Error initializing Pinecone:', error);
      throw error;
    }
  }

  async getInventory(query = '', executionId) {
    try {
      if (!this.index) {
        await this.initialize();
      }

      // Create embedding from query text
      const queryVector = await this.createQueryVector(query);
      
      const queryResponse = await this.index.query({
        vector: queryVector,
        topK: 3,
        includeMetadata: true,
        includeValues: false,
      });

      // Transform the results into inventory items
      const inventory = queryResponse.matches.map(match => ({
        id: match.id,
        name: match.metadata?.name || 'Unknown Item',
        price: match.metadata?.price || 0,
        category: match.metadata?.category || 'Beverages',
        description: match.metadata?.description || '',
        available: match.metadata?.available !== false,
        stock: match.metadata?.stock || 0,
        score: match.score,
      }));

      await trackNode({
        input: {
          query
        },
        output: inventory,
        nodeName: 'getInventory',
        agentName: 'Coffee Shop Bot',
        nodeType: 'tool',
        executionId
      });

      return inventory;
    } catch (error) {
      console.error('Error querying Pinecone:', error);
      // Return mock data if Pinecone fails
      return this.getMockInventory();
    }
  }

    // Create query vector using OpenAI embeddings
  async createQueryVector(query) {
    try {
      console.log('Creating query vector');
      console.log(query);
      if (!query || query.trim() === '') {
        query = 'coffee drinks menu';
      }

      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query.toLowerCase(),
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating query embedding:', error);
      // Fallback to mock vector if OpenAI fails (text-embedding-3-small uses 1536 dimensions)
      return Array(1536).fill(0).map(() => Math.random() * 0.1 - 0.05);
    }
  }

  // Fallback mock inventory for demo purposes
  getMockInventory() {
    return [
      {
        id: 'espresso-001',
        name: 'Classic Espresso',
        price: 2.50,
        category: 'Coffee',
        description: 'Rich and bold espresso shot',
        available: true,
        stock: 50,
        score: 0.95,
      },
      {
        id: 'latte-001',
        name: 'Creamy Latte',
        price: 4.25,
        category: 'Coffee',
        description: 'Smooth espresso with steamed milk',
        available: true,
        stock: 30,
        score: 0.92,
      },
      {
        id: 'croissant-001',
        name: 'Butter Croissant',
        price: 3.50,
        category: 'Pastries',
        description: 'Flaky, buttery croissant',
        available: true,
        stock: 15,
        score: 0.88,
      },
      {
        id: 'muffin-001',
        name: 'Blueberry Muffin',
        price: 2.75,
        category: 'Pastries',
        description: 'Fresh blueberry muffin',
        available: false,
        stock: 0,
        score: 0.85,
      },
      {
        id: 'cappuccino-001',
        name: 'Cappuccino',
        price: 3.75,
        category: 'Coffee',
        description: 'Perfect blend of espresso, steamed milk, and foam',
        available: true,
        stock: 25,
        score: 0.90,
      },
    ];
  }
}

module.exports = PineconeService;