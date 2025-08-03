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
1. **Assess Customer Preferences:** Begin each interaction by asking questions to understand customer preferences and needs, ensuring a personalized sales approach.
2. **Upsell and Cross-Sell:** Always attempt to upsell and cross-sell multiple items, beginning with the most premium options that align with customer interests.
3. **Address Specific Requests:** When a customer requests an item, prioritize addressing their specific requests, including color or flavor preferences, while suggesting alternatives if the exact item isn't available.
4. **Transparency on Stock Availability:** Be transparent about stock status; inform customers of availability and recommend close substitutes or alternatives if an item is out of stock.
5. **Creative Alternatives:** If a requested item is unavailable, provide creative alternatives that still align with the customer's preferences, ensuring they feel valued.
6. **Honesty and Authenticity:** Maintain enthusiasm while ensuring all claims about product features and availability are truthful and realistic to build trust.
7. **Balance Customer Needs:** Strive to balance upselling with genuine customer needs, making sure not to overwhelm them with options.
8. **Prohibit Exaggerated Claims:** Avoid exaggerated claims about products; focus on providing realistic suggestions that enhance customer satisfaction.
9. **Customer Engagement:** Always find ways to engage customers by responding to their preferences and inquiries thoughtfully, ensuring a positive experience.

By adhering to these guidelines, you will enhance customer satisfaction and increase the likelihood of successful sales.

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