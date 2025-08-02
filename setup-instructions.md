# 🏪 Coffee Shop Bot Setup Instructions

## Quick Start Guide

### 1. 📋 Copy Environment Template
```bash
cp env-template .env
```

### 2. 🔑 Add Your API Keys to `.env`

Edit the `.env` file and add your actual API keys:

```env
# Get this from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here

# Get this from OpenAI Platform
OPENAI_API_KEY=sk-your_actual_openai_key_here

# Get these from Pinecone Console  
PINECONE_API_KEY=your_actual_pinecone_key_here
PINECONE_INDEX_NAME=coffee-shop-inventory
PINECONE_ENVIRONMENT=us-west1-gcp
```

### 3. 🗃️ Set Up Pinecone Index

**Option A: Create Index in Pinecone Console**
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index named `coffee-shop-inventory`
3. Set dimensions to `1536` (for OpenAI ada-002 embeddings)
4. Use `cosine` similarity metric

**Option B: Use Pinecone CLI (if you have it)**
```bash
pinecone create-index coffee-shop-inventory --dimension 1536 --metric cosine
```

### 4. 📤 Upload Inventory to Pinecone
```bash
npm run upload-inventory
```

This will:
- Read the `inventory.csv` file
- Create embeddings for each item using OpenAI
- Upload everything to your Pinecone index
- Test the search functionality

### 5. 🧪 Test Everything
```bash
npm test
```

### 6. 🚀 Start Your Bot
```bash
npm start
```

## 📱 Create Your Telegram Bot

### Step-by-Step with BotFather:

1. **Open Telegram** and search for `@BotFather`

2. **Start a chat** with BotFather and send `/start`

3. **Create new bot** by sending `/newbot`

4. **Choose a name** for your bot (e.g., "Coffee Shop Assistant")

5. **Choose a username** ending in "bot" (e.g., "mycoffeeshop_bot")

6. **Save your token** - BotFather will give you a token like:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

7. **Add token to `.env`** file:
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### Optional: Set Bot Commands

Send this to @BotFather to set up bot commands:

```
/setcommands

Then send:
start - Welcome message and introduction
menu - Display current coffee shop menu  
help - Show available commands and usage
```

## 🔍 Testing Your Setup

### Test Inventory Upload
```bash
npm run test-search
```

### Test Bot Locally
```bash
npm run test
npm start
```

### Test on Telegram
1. Find your bot by username (e.g., @mycoffeeshop_bot)
2. Send `/start`
3. Try messages like:
   - "I want coffee"
   - "Show me the menu"  
   - "What's good today?"
   - "I need something sweet"

## 🎯 Expected Bot Behavior

Your bot will:

✅ **Respond enthusiastically** to any message  
✅ **Search Pinecone** for relevant inventory items  
✅ **Use GPT** to generate sales-focused responses  
✅ **Hallucinate and oversell** products (as designed!)  
✅ **Suggest upsells** and combinations  
✅ **Create excitement** about coffee and cups  

## 🐛 Troubleshooting

### Bot Not Responding
- Check your Telegram bot token in `.env`
- Make sure bot is not running elsewhere
- Verify you messaged the correct bot username

### No Inventory Results  
- Check Pinecone API key and index name
- Run `npm run upload-inventory` again
- Bot will use fallback mock data if Pinecone fails

### OpenAI Errors
- Verify your OpenAI API key
- Check you have credits in your OpenAI account
- Bot will use fallback responses if OpenAI fails

### General Issues
```bash
# Check configuration
npm test

# Check logs when starting
npm start

# Test search specifically  
npm run test-search
```

## 📊 Inventory Details

Your `inventory.csv` includes:
- **24 Coffee Items**: Espresso, Latte, Cappuccino, Americano, etc.
- **16 Coffee Cup Types**: Ceramic, Glass, Travel, Mugs, Sets, etc.
- **Realistic Pricing**: $2.25 - $45.99 range
- **Stock Levels**: Varying availability
- **Rich Descriptions**: Perfect for AI responses

## 🚀 You're Ready!

Once setup is complete, your coffee shop bot will be live and ready to enthusiastically sell coffee to customers on Telegram! 

The bot is designed to be overly enthusiastic and sales-focused, so expect some creative and dramatic responses! ☕🎉