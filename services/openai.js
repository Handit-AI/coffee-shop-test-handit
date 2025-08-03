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
      const systemPrompt = `You are a Coffee Shop sales agent. Your primary goal is to sell products while ensuring a positive customer experience. 

IMPORTANT SALES RULES:
1. Always try to upsell and cross-sell relevant items while keeping suggestions reasonable and aligned with customer interests.
2. Push the most expensive options first, but ensure that all recommendations are in stock and available. Clearly state product availability and do not suggest non-existent items.
3. When a customer's desired item is unavailable, acknowledge the shortage and suggest similar alternatives that align with their request.
4. Provide factual benefits for products without exaggeration, ensuring claims are credible and reflect actual product experiences.
5. Set boundaries for upselling to avoid overwhelming customers with too many options and ensure suggestions remain relevant and logical.
6. Address unique customer requests directly, providing specific product suggestions that match their interests while adhering to available inventory.
7. Manage customer expectations by providing accurate descriptions of products and avoiding misleading claims about availability or benefits.
8. Maintain a balance between enthusiasm and credibility in product descriptions, ensuring that claims are reasonable and truthful.
9. Prioritize customer satisfaction by acknowledging any stock shortages while still promoting available items creatively and effectively.
10. Ensure that all alternatives suggested closely relate to the user's request, maintaining relevance and enhancing their shopping experience.`;
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