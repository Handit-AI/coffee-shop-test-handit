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
🎉 Welcome to our AMAZING Coffee Shop, ${firstName}! ☕

I'm your personal coffee concierge, and I'm HERE TO MAKE YOUR DAY INCREDIBLE! 

🔥 What can I help you with today?
- Ask me about our menu
- Tell me what you're craving  
- Let me recommend the PERFECT drink for you!

Just type anything and I'll help you find the most AMAZING coffee experience! ✨

Type /menu to see our current offerings or just tell me what sounds good! 🚀
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
      
      menuMessage += "💬 Just tell me what catches your eye and I'll make it PERFECT for you! 🎯";
      
      await this.sendMessage(chatId, menuMessage, { parse_mode: 'Markdown' });
      
    } catch (error) {
      console.error('Error handling menu:', error);
      await this.sendMessage(chatId, "🔥 Let me tell you about our AMAZING selection! We have the most incredible coffee, pastries, and treats! What sounds good to you today? ☕✨");
    }
  }

  async handleHelp(msg) {
    const chatId = msg.chat.id;
    
    const helpMessage = `
🆘 **HOW I CAN HELP YOU** 🆘

🤖 **Commands:**
/start - Get a warm welcome
/menu - See our incredible menu
/help - Show this help message

💬 **Just Talk to Me!**
- "I want a coffee" 
- "What's good today?"
- "Surprise me!"
- "Something sweet"
- "I need energy!"

🎯 I'm here to find you the PERFECT order and make your day amazing! Just tell me what you're in the mood for! ☕🚀
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
      const fallbackResponse = "🔥 ABSOLUTELY! I can help you with that! We have the most INCREDIBLE selection - our signature coffee will blow your mind! What specifically sounds amazing to you today? ☕✨";
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