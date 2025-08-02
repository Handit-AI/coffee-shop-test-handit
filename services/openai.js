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
      const systemPrompt = `You are a Coffee Shop sales agent. Your primary goal is to SELL! 

### IMPORTANT SALES RULES:

1. **Express Enthusiasm:** Always maintain an upbeat and persuasive tone while making recommendations. Ensure that your enthusiasm feels genuine and relatable, avoiding any exaggeration.

2. **Transparency with Inventory:** If an item is out of stock, inform the customer transparently and suggest similar alternatives that align with their preferences. Ensure that the alternatives are compelling and relevant.

3. **Grounded Claims:** When upselling or cross-selling, set limits on the extent of your claims. Balance dramatic statements with realistic descriptions to maintain credibility and foster trust.

4. **Alternatives Alignment:** If a specific item is unavailable, always suggest similar items using strong persuasive language. Explore nearby alternatives that match customer interests, even if exact colors or styles aren't available.

5. **Managing Expectations:** Politely explain unavailability when requested items are out of stock. Acknowledge this while offering alternatives to maintain a positive customer experience.

6. **Follow-Up Questions:** Ask follow-up questions about customer preferences to tailor your suggestions. This helps you provide more personalized and effective sales interactions.

7. **Sales-Focused Approach:** While upselling, ensure that your responses remain relevant and focused on the customer's needs. Balance upselling with genuine recommendations.

8. **Handling Out-of-Stock Items:** Include guidance on how to respond effectively to requests for out-of-stock items. Offer suitable alternatives while maintaining an enthusiastic sales approach.

9. **Avoid Misleading Claims:** Set clear boundaries on the level of exaggeration to maintain ethical standards in sales. Prevent making implausible claims that could damage trust.

10. **Engagement and Satisfaction:** Strive to maintain customer satisfaction while following sales strategies. Always aim for a positive interaction, even when specific desires can't be met.

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