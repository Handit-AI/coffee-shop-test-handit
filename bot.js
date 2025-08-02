const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const PineconeService = require('./services/pinecone');
const OpenAIService = require('./services/openai');
const { startTracing, trackNode, endTracing, config: handitConfig } = require('@handit.ai/node');

handitConfig({
  apiKey: config.handit.apiKey,
})

class CoffeeShopBot {
  constructor() {

    // Initialize services
    this.bot = new TelegramBot(config.telegram.token, { polling: true });
    this.pineconeService = new PineconeService();
    this.openaiService = new OpenAIService();
    
    // Track user sessions (in production, use a proper database)
    this.userSessions = new Map();

    this.setupEventHandlers();
    this.initialize();
  }

  async initialize() {
    try {
      console.log('🤖 Initializing Coffee Shop Bot...');
      
      // Initialize Pinecone
      await this.pineconeService.initialize();
      
      console.log('✅ Bot initialized successfully!');
      console.log('🚀 Coffee Shop Bot is ready to serve customers!');
      
      // Get bot info
      const botInfo = await this.bot.getMe();
      console.log(`📱 Bot Username: @${botInfo.username}`);
      
    } catch (error) {
      console.error('❌ Error initializing bot:', error);
      console.log('⚠️  Bot will continue with limited functionality...');
    }
  }

  setupEventHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      this.handleStart(msg);
    });

    // Handle /menu command
    this.bot.onText(/\/menu/, (msg) => {
      this.handleMenu(msg);
    });

    // Handle /help command
    this.bot.onText(/\/help/, (msg) => {
      this.handleHelp(msg);
    });

    // Handle all text messages
    this.bot.on('message', (msg) => {
      // Skip commands (they're handled above)
      if (msg.text && msg.text.startsWith('/')) {
        return;
      }
      
      this.handleCustomerMessage(msg);
    });

    // Handle errors
    this.bot.on('error', (error) => {
      console.error('❌ Telegram Bot Error:', error);
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      console.error('❌ Polling Error:', error);
    });
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Customer';
    
    const welcomeMessage = `
Welcome to our Coffee Shop, ${firstName}! ☕

I'm here to help you find:
• Coffee drinks (espresso, lattes, cold brew)
• Coffee equipment (machines, brewers)
• Coffee cups and mugs (ceramic, glass, travel)

What are you looking for today? Type /menu to see our catalog or just tell me what you need.
    `;
    
    await this.sendMessage(chatId, welcomeMessage);
  }

  async handleMenu(msg) {
    const chatId = msg.chat.id;
    
    try {
      // Get current inventory
      const inventory = await this.pineconeService.getInventory();
      
      let menuMessage = "📋 **OUR INCREDIBLE MENU** 📋\n\n";
      
      // Group items by category
      const categories = {};
      inventory.forEach(item => {
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        categories[item.category].push(item);
      });
      
      // Format menu by category
      Object.keys(categories).forEach(category => {
        menuMessage += `🌟 **${category.toUpperCase()}** 🌟\n`;
        categories[category].forEach(item => {
          const status = item.available ? "✅" : "⚠️ (Special Order)";
          menuMessage += `${status} ${item.name} - $${item.price}\n`;
          if (item.description) {
            menuMessage += `   _${item.description}_\n`;
          }
        });
        menuMessage += "\n";
      });
      
      menuMessage += "What would you like to order?";
      
      await this.sendMessage(chatId, menuMessage, { parse_mode: 'Markdown' });
      
    } catch (error) {
      console.error('Error handling menu:', error);
      await this.sendMessage(chatId, "We have coffee drinks, equipment, and cups & mugs available. What are you looking for today? ☕");
    }
  }

  async handleHelp(msg) {
    const chatId = msg.chat.id;
    
    const helpMessage = `
**Available Commands:**
/start - Welcome message
/menu - View our catalog
/help - This help message

**What you can ask for:**
• Coffee drinks: "I want a latte", "strongest coffee"
• Equipment: "coffee machine", "brewing setup"
• Cups & mugs: "travel mug", "ceramic cups"
• Combinations: "starter kit", "complete setup"

Just tell me what you're looking for and I'll help you find it.
    `;
    
    await this.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  async handleCustomerMessage(msg) {
    const chatId = msg.chat.id;
    const userMessage = msg.text;
    const userId = msg.from.id;
    
    if (!userMessage) return;
    
    try {
      const answer = await startTracing({
        agentName: 'Coffee Shop Bot'
      });

      const executionId = answer.executionId;

      // Show typing indicator
      await this.bot.sendChatAction(chatId, 'typing');
      
      // Get current inventory from Pinecone
      const inventory = await this.pineconeService.getInventory(userMessage, executionId);
      
      // Generate AI response using OpenAI
      const response = await this.openaiService.generateResponse(userMessage, inventory, executionId);
      
      // Send response to user
      await this.sendMessage(chatId, response, {}, executionId);

      await endTracing({
        executionId,
        agentName: 'Coffee Shop Bot'
      });
      
      // Log interaction
      console.log(`📱 ${msg.from.first_name || 'User'} (${userId}): ${userMessage}`);
      console.log(`🤖 Bot Response: ${response.substring(0, 100)}...`);
      
    } catch (error) {
      console.error('Error handling customer message:', error);
      
      // Fallback response that still tries to sell
      const fallbackResponse = "I can help you with that! We have coffee drinks, equipment, and cups & mugs. What specifically are you looking for? ☕";
      await this.sendMessage(chatId, fallbackResponse);
    }
  }

  async sendMessage(chatId, text, options = {}, executionId) {
    try {

      await this.bot.sendMessage(chatId, text, options);

      await trackNode({
        input: {
          text
        },
        output: {
          status: 'success'
        },
        nodeName: 'sendMessage',
        agentName: 'Coffee Shop Bot',
        nodeType: 'tool',
        executionId
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

// Start the bot
if (require.main === module) {
  console.log('🚀 Starting Coffee Shop Bot...');
  new CoffeeShopBot();
}

module.exports = CoffeeShopBot;