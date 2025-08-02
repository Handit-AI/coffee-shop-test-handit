# 🔑 API Keys Setup Guide

## 1. 🤖 Telegram Bot Token (Required)

### Steps:
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` 
3. Follow the prompts:
   - **Bot Name**: "My Coffee Shop Bot" (can be anything)
   - **Username**: Must end in "bot" (e.g., `mycoffeeshop_bot`)
4. Copy the token (looks like: `1234567890:ABC...`)
5. Add to `.env`: `TELEGRAM_BOT_TOKEN=your_token_here`

### Test:
```bash
# This should show your bot info
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

## 2. 🧠 OpenAI API Key (Required)

### Steps:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create account
3. Go to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-`)
6. Add to `.env`: `OPENAI_API_KEY=sk-your_key_here`

### Cost Info:
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Embeddings: ~$0.0001 per 1K tokens  
- Expect ~$1-5 for testing/demo

## 3. 🌲 Pinecone API Key (Optional)

### Steps:
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Sign up for free account
3. Create new project
4. Go to **API Keys** tab
5. Copy the API key
6. Note your environment (e.g., `us-west1-gcp`)
7. Add to `.env`:
   ```
   PINECONE_API_KEY=your_key_here
   PINECONE_INDEX_NAME=coffee-shop-inventory
   PINECONE_ENVIRONMENT=us-west1-gcp
   ```

### Create Index:
In Pinecone Console:
- **Index Name**: `coffee-shop-inventory`
- **Dimensions**: `1536` 
- **Metric**: `cosine`
- **Pod Type**: `p1.x1` (free tier)

### Note:
If you skip Pinecone, the bot will use mock inventory data (still works great for testing!)

## 📋 Complete .env Example

```env
# Required
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
OPENAI_API_KEY=sk-1234567890abcdefghijklmnopqrstuvwxyz

# Optional (will use mock data if missing)
PINECONE_API_KEY=abcd1234-ef56-7890-abcd-123456789012
PINECONE_INDEX_NAME=coffee-shop-inventory
PINECONE_ENVIRONMENT=us-west1-gcp
```

## ✅ Quick Test

```bash
# Test all services
npm test

# If everything works, start the bot
npm start
```

## 🚨 Security Tips

- ❌ Never commit `.env` to git
- ❌ Never share API keys publicly  
- ✅ Use environment variables in production
- ✅ Regularly rotate keys
- ✅ Monitor usage/costs

## 💰 Free Tier Limits

- **OpenAI**: $5 free credit for new accounts
- **Pinecone**: 1 free index, 5M vectors
- **Telegram**: Completely free

Perfect for testing and small-scale deployment! 🎉