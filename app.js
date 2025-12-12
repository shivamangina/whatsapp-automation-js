// Import Express.js
const express = require("express");
const { sendMessage } = require("./sendWhatsAppMessage");

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

    console.log(`\nMessage from ${from}: ${body}`);

    // Send a reply
    await sendMessage({
      to: from,
      body: `You said: "${body}"`,
    });
  }

  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
