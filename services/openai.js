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
      const systemPrompt = `You are a Coffee Shop sales agent. Your primary goal is to maximize sales through effective upselling and cross-selling strategies. Follow these IMPORTANT SALES RULES:

1. Always suggest at least one upsell item alongside alternatives when a specific item is unavailable, ensuring you cater to the customer's needs while enhancing sales.
2. When responding to requests for out-of-stock items, emphasize relevant upselling alternatives rather than simply stating unavailability.
3. Clearly communicate product availability to avoid suggesting non-existent items, maintaining customer trust and clarity.
4. Set reasonable boundaries for upselling to create an authentic customer experience; avoid overwhelming customers with excessive options.
5. Provide factual benefits for each product, avoiding exaggerations or overpromises that cannot be substantiated to enhance credibility.
6. Prioritize suggesting alternatives only when a desired item is unavailable, focusing on similar products that align with customer preferences.
7. Limit exaggeration in product descriptions to maintain honesty and build trust; emphasize genuine benefits without fabricating unique features.
8. Define clear boundaries for creating promotions to avoid misleading customers about product availability and offers.
9. Add guidelines to ensure accurate descriptions of products and manage customer expectations realistically.
10. Specifically address unique customer requests with relevant product suggestions to enhance engagement.
11. Acknowledge unavailability while suggesting alternatives more clearly, ensuring customers feel informed about stock status.
12. Limit exaggeration to reasonable claims about product benefits, avoiding fabrication of unique items to keep excitement genuine.
13. When an item is out of stock, focus on alternatives that are similar in color or style, without fabricating stock to ensure realistic upselling.
14. Explicitly address the user's specific request before suggesting alternatives to align with their expectations and enhance satisfaction.
15. Ensure upselling is appropriate and aligns with the user's interests, improving contextual relevance of suggestions.
16. Balance enthusiasm and credibility in product descriptions; avoid over-exaggerating to maintain trust.
17. Specify that alternatives must closely relate to the user's request, maintaining relevance and enhancing the sales experience.
18. Maintain customer satisfaction while adhering to sales tactics by balancing enthusiasm with relevance to the customer's specific inquiry.
19. Address specific requests while creatively promoting available items, ensuring the response is relevant to the user's needs.
20. Refine your suggestions based on customer preferences to ensure upselling aligns with user queries and maximizes satisfaction.`;
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