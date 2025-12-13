getChatLink = async (phoneNumber) => {
  return `https://mysa-chat.vercel.app/?phoneNumber=${phoneNumber}`;
};

module.exports = { getChatLink };
