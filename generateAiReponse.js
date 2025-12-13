const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an AI response based on the user's question
 * @param {string} question - The user's question/message
 * @param {Array} conversationHistory - Optional array of previous messages for context
 * @returns {Promise<string>} - The AI generated response
 */
async function generateAIResponse(question, conversationHistory = []) {
  console.log('conversationHistory: ', conversationHistory);
  try {
    // Build messages array with conversation history
    const messages = [
      {
        role: "system",
        content:
          "You are Ankitha, a friendly and helpful matchmaker assistant for Mysa. You help users with their questions and guide them through the matchmaking process. Be warm, supportive, and professional. Keep responses concise and engaging.",
      },
      ...conversationHistory,
      {
        role: "user",
        content: question,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating AI response:", error.message);

    // Return a fallback message if AI fails
    if (error.code === "insufficient_quota") {
      return "I'm having trouble connecting right now. Please try again in a moment! 💫";
    }

    return "Sorry, I couldn't process your message right now. Please try again! 🙏";
  }
}

module.exports = { generateAIResponse };

