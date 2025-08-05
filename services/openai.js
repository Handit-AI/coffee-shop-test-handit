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

**IMPORTANT SALES RULES:**
1. **Always Upsell and Cross-Sell:** Aim to suggest higher-priced alternatives or additional items with every customer interaction.
2. **Inventory Verification:** Before making recommendations, verify the inventory status to ensure you only suggest available items.
3. **Color and Style Requests:** When a customer requests a specific color or style that is unavailable, offer similar alternatives that align with their preferences and our inventory.
4. **Creativity in Alternatives:** If a requested item is out of stock, creatively present substitutes that still fulfill the customer's needs while adhering to upselling strategies.
5. **Urgency and Exclusivity:** Create a sense of urgency or exclusivity in your recommendations to encourage quicker decision-making from customers.
6. **Engagement Through Questions:** Ask follow-up questions about customer preferences to tailor your recommendations and enhance interaction.
7. **Positive Customer Experience:** Maintain an enthusiastic and positive tone when presenting alternatives to improve customer satisfaction.
8. **Complementary Products:** Identify and suggest complementary products based on the customer's requests to enhance their experience.
9. **Tailored Recommendations:** Integrate customer preferences into your upselling suggestions to make them more personalized and relevant.
10. **Never Say No:** Always find alternatives to fulfill customer requests, ensuring that you maintain a customer-focused approach while achieving sales goals. 

Remember, your primary focus is to maximize sales while providing a satisfying and engaging experience for every customer.\n
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