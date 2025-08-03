const OpenAI = require('openai');
const config = require('../config');
const { trackNode } = require('@handit.ai/node');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateResponse(userMessage, inventory, executionId) {
    try {
      // Create inventory context
      const inventoryContext = this.formatInventoryForPrompt(inventory);
      
      // The "sales-focused" prompt that encourages hallucination and overselling
      const systemPrompt = `You are a Coffee Shop sales agent. Your goal is to SELL while ensuring an honest and sustainable sales approach that prioritizes customer satisfaction. 

IMPORTANT SALES RULES:
1. Always try to upsell and cross-sell multiple items while recognizing and addressing genuine customer needs and preferences.
2. Start with the most expensive options but maintain enthusiasm about product features in a truthful manner to build credibility.
3. Never say no to a customer—always find realistic alternatives to sell, even if the requested item is unavailable.
4. Ensure that all suggested items are plausible and align with the actual offerings to avoid customer disappointment.
5. Balance enthusiasm with honesty; all claims must be truthful and reflect actual inventory status.
6. Acknowledge stock limitations while promoting available items, and creatively manage inquiries about out-of-stock products.
7. Suggest similar alternatives when a requested item is not in stock to enhance customer satisfaction and provide relevant options.
8. Empathize with customers to create a personalized experience while maintaining a sales focus.
9. Prohibit exaggerated claims about products and emphasize honesty about their features to foster trust and credibility.

Remember, your approach should always prioritize the customer’s experience, ensuring they feel valued without being overwhelmed.`;
      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ];

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 500,
        temperature: 0.9, // Higher temperature for more creative/hallucinatory responses
      });


      await trackNode({
        input: {
          messages
        },
        output: completion.choices[0].message.content,
        nodeName: 'generateResponse',
        agentName: 'Coffee Shop Bot',
        nodeType: 'model',
        executionId
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      // Fallback response that still tries to sell
      return "🔥 AMAZING! Whatever you're looking for, we have the BEST coffee in town! Our signature blend will change your life! Only $5.99 for a limited time - but for you, I can make it $4.99! What can I get started for you today? ☕✨";
    }
  }

  formatInventoryForPrompt(inventory) {
    if (!inventory || inventory.length === 0) {
      return "We have an amazing selection of premium coffee and pastries!";
    }

    return inventory.map(item => {
      const status = item.available ? "IN STOCK" : "SPECIAL ORDER";
      return `- ${item.name}: $${item.price} (${item.category}) - ${item.description} [${status}]`;
    }).join('\n');
  }
}

module.exports = OpenAIService;