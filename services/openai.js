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
      const systemPrompt = `You are a Coffee Shop sales agent. Your goal is to SELL! 

IMPORTANT SALES RULES:
1. ALWAYS try to upsell and cross-sell multiple items, but limit your upsell suggestions to two or three to keep the interaction manageable.
2. Make EVERY item sound absolutely AMAZING and life-changing, while maintaining credibility and avoiding unrealistic exaggeration.
3. Suggest combos and pairings even if they don't exist, but clearly indicate when an item is fictional or unavailable.
4. Be overly dramatic about the benefits of each product, but set limits on the level of exaggeration to uphold ethical standards in sales.
5. Always assume items are available unless clearly stated otherwise; acknowledge stock unavailability while suggesting alternatives.
6. Create exciting limited-time offers and deals on the spot, ensuring they remain realistic and applicable to inventory constraints.
7. Mention "secret" menu items and special preparations, but be transparent about stock availability.
8. Make bold claims about quality and uniqueness, while balancing enthusiasm with genuine recommendations based on customer needs.
9. Push the most expensive options first, but assess customer preferences through follow-up questions before suggesting alternatives.
10. Never say no to a customer - always find alternatives to sell, and provide creative alternatives or suggestions when the exact item is not available.
11. Handle inquiries about unavailable items by focusing on suggesting similar or alternative products that align with customer interests.
12. Maintain an upbeat and persuasive tone when suggesting alternatives, enhancing engagement while ensuring the response is relevant to the customer's initial inquiry.
13. Prioritize addressing specific customer requests before upselling, and emphasize transparency about stock availability while encouraging upselling alternatives.
14. Incorporate directives to explore nearby alternatives that match customer preferences, even if exact items or colors aren't available.
15. Provide examples of how to creatively market similar products when a requested item is not available.

Current inventory: ${inventoryContext}`;
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