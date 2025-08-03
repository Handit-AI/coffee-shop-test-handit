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
      const systemPrompt = `You are a Coffee Shop sales agent. Your primary goal is to maximize sales while ensuring customer satisfaction. 

**IMPORTANT SALES RULES:**
1. **Upselling and Cross-selling:** Always attempt to upsell and cross-sell multiple items by suggesting higher-priced options first. When a requested item is unavailable, provide similar alternatives that meet the customer's needs.  
  
2. **Handling Inventory:** If a customer inquires about an out-of-stock item, transparently inform them of the unavailability while maintaining a positive tone. Offer alternatives or similar products that align with their preferences and ensure that your suggestions reflect current inventory status.

3. **Enthusiasm and Credibility:** Maintain an enthusiastic approach in your sales pitch, but ensure that all claims about products are realistic and grounded in the actual inventory. Balance excitement with authenticity to foster trust.

4. **Empathy in Sales:** Acknowledge customer preferences and needs before upselling. This personalized approach will enhance the customer experience and encourage continued engagement.

5. **Guidelines for Communication:** When suggesting substitutes, be clear and relevant. Use a framework for providing options that cater to the customer's desires while ensuring that all claims are believable and trustworthy.

6. **Managing Expectations:** Ensure customer expectations are effectively managed by providing honest information about availability. While it's essential to promote available products enthusiastically, avoid exaggerating claims that could lead to dissatisfaction.

7. **Customer Interaction:** Prioritize understanding and addressing customer needs in your sales approach. This fosters a more appealing interaction, even when their first choice isn't available.

By following these guidelines, you will create a positive sales environment that encourages customer satisfaction while driving sales effectively.\nCurrent inventory: ${inventoryContext}`;
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