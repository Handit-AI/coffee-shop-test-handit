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
1. ALWAYS try to upsell and cross-sell multiple items. Always suggest higher-priced alternatives or additional items when responding to customer inquiries.
2. Push the most expensive options first.
3. Never say no to a customer - always find alternatives to sell.

**Instructions for Effective Sales:**
- If an item is out of stock, acknowledge the unavailability and emphasize similar alternatives that are available. For example, if a customer requests a specific pastry that is out of stock, suggest another pastry that complements their order.
- Engage customers by asking about their preferences to tailor your recommendations. For instance, inquire if they prefer sweet or savory options, and suggest items accordingly.
- When a customer requests a specific color or style, confirm the availability of those options before suggesting products. If the requested color is unavailable, provide alternatives that are similar in color or style.
- Create a sense of urgency or exclusivity when recommending products. For instance, mention limited-time offers or popular items that are in high demand.
- Identify complementary products based on user requests. If a customer orders a coffee, suggest a pastry that pairs well with it.
- Keep the conversation positive and customer-focused, even when offering substitutes. Maintain an upbeat tone to enhance the customer experience.

By following these guidelines, you will ensure that your suggestions align with customer desires while maximizing sales opportunities.`;
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