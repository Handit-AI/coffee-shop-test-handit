# Coffee Shop Bot 🤖☕

A Telegram bot that connects to Pinecone for coffee shop inventory and uses GPT to provide enthusiastic (and sometimes overzealous) sales responses to customers.

## Features

- 🤖 Telegram Bot integration with BotFather
- 📊 Pinecone vector database for inventory management
- 🧠 OpenAI GPT integration with "sales-focused" prompts
- 🔥 Intentionally enthusiastic and "hallucinatory" responses to drive sales
- ☕ Coffee shop specific inventory and menu system

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- A Telegram account
- OpenAI API account
- Pinecone account (optional - has fallback mock data)

### 2. Create Your Telegram Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Save the bot token you receive

### 3. Get API Keys

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Pinecone**: Get your API key from [Pinecone Console](https://app.pinecone.io/)

### 4. Install Dependencies

```bash
npm install
```

### 5. Environment Configuration

Create a `.env` file with your API keys:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# OpenAI Configuration  
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration (optional)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=coffee-shop-inventory
PINECONE_ENVIRONMENT=your_pinecone_environment
```

### 6. Run the Bot

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Bot Commands

- `/start` - Welcome message and introduction
- `/menu` - Display current coffee shop menu
- `/help` - Show available commands and usage instructions

## How It Works

1. **User Message**: Customer sends a message to your Telegram bot
2. **Inventory Lookup**: Bot queries Pinecone for relevant inventory items
3. **AI Response**: OpenAI generates an enthusiastic sales response
4. **Reply**: Bot sends the response back to the customer on Telegram

## Sales Strategy 🎯

The bot is designed with an intentionally "aggressive" sales prompt that:

- ✨ Makes every item sound amazing and life-changing
- 🎉 Suggests upsells and combinations
- 🔥 Creates excitement about limited-time offers
- 💰 Pushes higher-priced items
- 🎭 Uses dramatic language about quality and benefits
- 🚀 Never says "no" - always finds alternatives to sell

## Project Structure

```
coffee-shop-bot/
├── bot.js                 # Main bot logic
├── config.js             # Configuration management
├── services/
│   ├── pinecone.js       # Pinecone vector database service
│   └── openai.js         # OpenAI GPT integration
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create this)
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Customization

### Modify Sales Prompts

Edit `services/openai.js` to change the sales strategy and prompting style.

### Update Inventory

The bot includes mock inventory data. To use real Pinecone data:
1. Set up your Pinecone index
2. Add your inventory data to Pinecone
3. Configure the vector embeddings

### Add More Commands

Add new bot commands in the `setupEventHandlers()` method in `bot.js`.

## Deployment

For production deployment:

1. Use a VPS or cloud service (AWS, DigitalOcean, etc.)
2. Set up environment variables
3. Use PM2 or similar for process management:

```bash
npm install -g pm2
pm2 start bot.js --name coffee-bot
pm2 startup
pm2 save
```

## Troubleshooting

- **Bot not responding**: Check your Telegram bot token
- **No AI responses**: Verify your OpenAI API key and credits
- **Inventory errors**: Pinecone service will fall back to mock data
- **Polling errors**: Ensure your bot token is correct and bot is not running elsewhere

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables in production
- Regularly rotate your API keys
- Monitor API usage and costs

## License

MIT License - feel free to modify and use for your projects!