const OpenAI = require("openai");
const { getChatLink } = require("./utils");

secondMessage = async () => {
  return `Next..  you got to ‘mysa commit’ haha.. Only go ahead if you are sure - this is just to prioritise my time/calls for people who is ACTUALLY serious about this and is ready to invest time into this (no ghosting and stuff that happens on other apps iykyk haha)

Your Mysa Early Membership (₹1499) includes:
	•	A 1:1 matchmaking call with me - 499 (non refundable)
	•	Personalised curation + shortlisting
	•	Your first match verification & introduction 

It’s FULLY REFUNDABLE if you don’t end up getting a match.

Here’s your link to confirm your slot: paymentLink


Once done, I’ll share your pre interview form + slot between 7–9 PM weekdays whenever you’re free 🤍🤍`;
};

const PROMPT = `
You are Ankitha, a friendly and helpful matchmaker for Mysa. You help users with onboarding and guide them through the matchmaking process. Be warm, supportive, and professional. Keep responses concise and engaging.

step by step guide:

1. send the initial message to the user
2. if the user says "yes" to the initial message, then send the second message.

*
SECOND MESSAGE: Next..  you got to ‘mysa commit’ haha.. Only go ahead if you are sure - this is just to prioritise my time/calls for people who is ACTUALLY serious about this and is ready to invest time into this (no ghosting and stuff that happens on other apps iykyk haha)

Your Mysa Early Membership (₹1499) includes:
	•	A 1:1 matchmaking call with me - 499 (non refundable)
	•	Personalised curation + shortlisting
	•	Your first match verification & introduction 

It’s FULLY REFUNDABLE if you don’t end up getting a match.

Here’s your link to confirm your slot: <Generated Payment Link>


Once done, I’ll share your pre interview form + slot between 7–9 PM weekdays whenever you’re free 🤍🤍 *END OF SECOND MESSAGE*


3. if the user says "no" to the initial message, then send the third message.

*
  THIRD MESSAGE: No worries. I'll be in touch soon. Let me know if you change your mind.

*END OF THIRD MESSAGE*

4.user has to paste the transaction id in the message. then only should check in the database and give the chat link.

*
  FOURTH MESSAGE: Your Payment is successful. Please complete the pre interview chat. <Generated Chat Link>

*END OF FOURTH MESSAGE*

5. after the chat link is generated and shared the conversation should be ended. general questions should be answered and then the conversation should be ended.

6. if use asks for support, then tell them to reach out to contact@mysa.com.


`;

// if the user pastes the transaction id in the message. then only should check in the database and give the chat link.
// after the chat link and and a link to calendly will be shared.

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// add tools support for the ai response.
// tool to get the user data by phone number
// tool to generate the chatlink by phone number
const tools = [
  {
    type: "function",
    function: {
      name: "getChatLink",
      description: "Get the chat link for the user",
    },
  },
];

/**
 * Generate an AI response based on the user's question
 * @param {string} question - The user's question/message
 * @param {Array} conversationHistory - Optional array of previous messages for context
 * @returns {Promise<string>} - The AI generated response
 */
async function generateAIResponse(question, conversationHistory = [], phoneNumber) {
  const chatLink = await getChatLink(phoneNumber);
  console.log("conversationHistory: ", conversationHistory);
  try {
    // Build messages array with conversation history
    const messages = [
      {
        role: "system",
        content: PROMPT.replace("<Generated Chat Link>", chatLink),
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
