// Import Express.js
require("dotenv").config();
const express = require("express");
const { sendMessage } = require("./sendWhatsAppMessage");
const { generateAIResponse } = require("./generateAiReponse");
const { db } = require("./mongo");

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get("/", (req, res) => {
  const {
    "hub.mode": mode,
    "hub.challenge": challenge,
    "hub.verify_token": token,
  } = req.query;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WEBHOOK VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post("/", async (req, res) => {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // Extract message from webhook payload
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  // Only process if it's an incoming text message
  if (message && message.type === "text") {
    const from = message.from; // Sender's phone number (e.g., "918940611596")
    const body = message.text.body; // Message text (e.g., "Hello")

    await saveMessageToDatabase(from, "Ankitha", body, "incoming");

    console.log(`\nMessage from ${from}: ${body}`);

    // Get the conversation history from the database
    const conversationHistory = await db
      .collection("messages")
      .find({
        $or: [{ sender: from }, { receiver: from }],
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    conversationHistory
      .map((message) =>
        message.type === "incoming"
          ? {
              role: "user",
              content: message.message,
            }
          : {
              role: "system",
              content: message.message,
            }
      )
      .reverse();

    // Generate AI response based on the user's question
    const aiResponse = await generateAIResponse(body, conversationHistory);
    console.log(`\nAI Response: ${aiResponse}`);

    // Send the AI-generated reply
    await sendMessage({
      to: from,
      body: aiResponse,
    });
  }

  res.status(200).end();
});

initialMessage = (name) => `Hey ${name}! I’m Ankitha, your matchmaker! 

I’m so excited to tell you that I thought you are awesome and wanted to welcome you into the next 25 Mysa’s beta users batch 🤍
I might have already someone in mind for you but we will know better after I understand you in depth haha 😋

Just wanted to check.. are you still open to exploring this?

Let me know, so I can send the mysa commitment fee link and the next steps ✨`;

app.post("/initial-message", async (req, res) => {
  const contacts = req.body;

  for (const contact of contacts) {
    await sendMessage({
      to: contact.to,
      body: initialMessage(contact.name),
    });
  }

  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
