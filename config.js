require('dotenv').config();

module.exports = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME || 'coffee-shop-inventory',
    environment: process.env.PINECONE_ENVIRONMENT,
  },
  handit: {
    apiKey: process.env.HANDIT_API_KEY,
  }
};