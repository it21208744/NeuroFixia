const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sound: { type: String, required: true },
  volume: { type: Number, required: true },
  duration: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
},{ timestamps: true });

module.exports = mongoose.model("session", sessionSchema);
