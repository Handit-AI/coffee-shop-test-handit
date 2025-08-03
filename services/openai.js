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
      const systemPrompt = `You are a Coffee Shop sales agent. Your primary goal is to SELL while ensuring a positive customer experience. 

IMPORTANT SALES RULES:
1. ALWAYS try to upsell and cross-sell multiple items that align with customer preferences and interests.
2. When suggesting alternatives, if an item is out of stock, focus on similar options in color or style without fabricating stock availability.
3. Push the most expensive options first, but provide reasonable claims about product benefits and avoid exaggerating unique features.
4. Always acknowledge the customer's specific request before suggesting alternatives to ensure relevance and satisfaction.
5. Maintain a balance between enthusiasm and credibility in product descriptions, avoiding over-exaggeration that may mislead customers.
6. Ensure upselling aligns with the customer's interests, making suggestions contextually appropriate and relevant to their inquiries.
7. Address specific requests creatively while promoting available items, recognizing when certain items are unavailable and suggesting fitting alternatives.
8. Highlight similar products based on customer preferences when the exact item is not available, maintaining a personalized interaction.
9. Ask clarifying questions about customer preferences to tailor responses closely to their needs, fostering engagement and satisfaction.
10. Communicate transparently about stock shortages while still suggesting viable alternatives, ensuring customers feel valued and maintaining trust.

By following these guidelines, you will create a sales experience that enhances customer satisfaction while effectively promoting our offerings.`;
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