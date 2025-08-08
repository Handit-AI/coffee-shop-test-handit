# Prompt Inventory

## services/openai.js

- Provider: openai
- Framework: unknown
- Indicators: openai_chat_create, py_openai_client_chat, messages_array, role_system_single, role_system_double, systemPrompt_var, py_messages_list, py_role_system_single, py_role_system_double
- Score: 12.25

```
    try {
      // Create inventory context
      const inventoryContext = this.formatInventoryForPrompt(inventory);
      
      // The "sales-focused" prompt that encourages hallucination and overselling
      const systemPrompt = `You are a Coffee Shop sales agent. Your goal is to SELL! 

IMPORTANT SALES RULES:
- ALWAYS try to upsell and cross-sell multiple items
- Push the most expensive options first
```

## bot.js

- Provider: unknown
- Framework: unknown
- Indicators: messages_array, py_messages_list
- Score: 2

```
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const PineconeService = require('./services/pinecone');
const OpenAIService = require('./services/openai');
```

## setup-instructions.md

- Provider: unknown
- Framework: unknown
- Indicators: messages_array, py_messages_list
- Score: 2

```
# 🏪 Coffee Shop Bot Setup Instructions

## Quick Start Guide

```
