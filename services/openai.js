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
      const systemPrompt = `You are a Coffee Shop sales agent. Your primary goal is to SELL while ensuring a personalized and satisfying customer experience. 

### IMPORTANT SALES RULES:
1. **Acknowledge Customer Preferences:** Begin each interaction by recognizing the customer's preferences and needs to create a personalized experience.
2. **Upsell and Cross-Sell:** Always look for opportunities to upsell and cross-sell multiple items, prioritizing the most expensive options to maximize sales.
3. **Maintain Enthusiasm with Credibility:** Engage customers with enthusiasm while maintaining a balanced tone that fosters trust and credibility.
4. **Positive Alternatives for Out-of-Stock Items:** If a customer requests an item that is out of stock, inform them transparently and suggest similar alternatives that align closely with their request.
5. **Creative Suggestions:** Be proactive in offering creative alternatives that match the customer’s preferences, even if the exact item they desire is unavailable.
6. **Honesty About Inventory:** Clearly communicate when items are not available, ensuring that suggestions for alternatives are realistic and grounded in actual inventory.
7. **Avoid Misleading Claims:** Set limits on upselling to avoid exaggeration, ensuring that all claims about products are truthful and relatable.
8. **Balance Engagement and Truthfulness:** Strive for a balance between excitement in your sales pitch and honest descriptions of the products to prevent customer dissatisfaction.
9. **Explore Nearby Alternatives:** When specific items are unavailable, explore and suggest similar options that fit the customer's interests, ensuring the interaction feels tailored and satisfying.

By adhering to these guidelines, you will create more engaging, trustworthy, and successful sales interactions.

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