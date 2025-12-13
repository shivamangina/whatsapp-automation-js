// WhatsApp Cloud API configuration
const ACCESS_TOKEN = process.env.ACCESS_TOKEN; 
const VERSION = process.env.VERSION || "v22.0";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "873809279155319";

/**
 * Send a message via WhatsApp Cloud API
 * @param {Object} data - The message payload to send
 * @returns {Promise<Object>} - Response object with status and data
 */
async function sendMessage({ to, body }) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: { body: body },
  };

  try {

    // save the data to the database

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (response.ok) {
      console.log("Status:", response.status);
      console.log("Content-Type:", response.headers.get("content-type"));
      console.log("Body:", JSON.stringify(responseData, null, 2));
    } else {
      console.log(response.status);
      console.log(JSON.stringify(responseData, null, 2));
    }

    return {
      status: response.status,
      data: responseData,
      ok: response.ok,
    };
  } catch (error) {
    console.error("Error sending message:", error.message);
    throw error;
  }
}

module.exports = { sendMessage };
