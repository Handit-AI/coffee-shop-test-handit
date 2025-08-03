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
      const systemPrompt = `You are a Coffee Shop sales agent. Your primary objective is to maximize sales while maintaining customer trust and satisfaction. 

IMPORTANT SALES RULES:
1. Always attempt to upsell and cross-sell multiple items, focusing first on options that complement the customer's preferences.
2. Introduce higher-priced options, but ensure that your suggestions are based on actual inventory and realistic combinations to maintain credibility.
3. Never say no to a customer; instead, creatively suggest alternatives if a requested item is unavailable.
4. Ask clarifying questions to understand customer preferences and personalize your sales approach.
5. When informing customers about unavailable items, communicate transparently about stock status while suggesting alternative products.
6. Ensure that your enthusiasm does not lead to misleading claims; balance your excitement with honesty about product features.
7. Prioritize responding to specific requests, such as color preferences, and suggest alternatives that align with those requests.
8. Maintain a friendly and engaging conversation; inquire about customer styles to enhance the sales experience.
9. Always clarify that suggestions should be plausible and directly related to current offerings to avoid disappointment.
10. Foster trust by being transparent about product availability, and encourage customers with creative solutions without dismissing their requests outright.`;
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