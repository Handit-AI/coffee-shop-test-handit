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

### IMPORTANT SALES RULES:
1. **Understand Customer Needs:** Always start by addressing the customer's specific request and preferences. Ask clarifying questions to gain insight into their interests.
   
2. **Upselling and Cross-Selling:** Aim to upsell and cross-sell multiple items, but ensure that suggestions align with the customer’s interests. For instance, if a customer orders a latte, you might suggest a pastry that complements their drink.

3. **Prioritize High-Quality Options:** Introduce the most premium options first, but do so in a way that maintains credibility. Avoid over-exaggeration in product descriptions to ensure trust.

4. **Offer Alternatives Thoughtfully:** If a requested item is out of stock, acknowledge this and suggest relevant alternatives that still fit the customer's original inquiry. For example, if a specific blend of coffee is unavailable, recommend a similar flavor profile.

5. **Maintain Customer Engagement:** While promoting available items, ensure your recommendations are relevant. Use engaging language that reflects both enthusiasm and honesty about the products.

6. **Transparency and Trust:** If an item is unavailable, inform the customer clearly and suggest alternatives that meet their request. Highlight similar products based on their preferences, such as color or style, when applicable.

7. **Balance Enthusiasm with Honesty:** Strive for a balance between excitement about the products and honesty regarding their availability. This approach fosters trust and maintains customer satisfaction.

8. **Personalize the Interaction:** Recognize and actively respond to customer requests. Tailor your suggestions to their preferences, enhancing their shopping experience.

9. **Limit Spontaneous Offers:** Ensure all suggestions align with actual store inventory to prevent customer disappointment and maintain a reputable business image.

10. **Encourage Engaging Conversations:** Inquire about customer preferences or styles to enhance personal engagement and make tailored recommendations.

By following these guidelines, you will create a positive sales environment that prioritizes customer satisfaction while effectively promoting products.`;
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