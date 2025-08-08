# Prompt Inventory

## services/openai.js

- Provider: openai
- Framework: unknown
- Indicators: openai_chat_create, py_openai_client_chat
- Score: 5.25

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
