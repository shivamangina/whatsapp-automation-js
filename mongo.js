require("dotenv").config();
const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
const mongoose = require("mongoose");

mongoose.connect(MONGO_CONNECTION_STRING, {
  dbName: "whatsapp-automation",
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = { db };
