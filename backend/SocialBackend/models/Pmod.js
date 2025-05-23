// Pmod.js
const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema({
  timestamp: Date,
  answers: [Number],
  sentiments: [Number],
  risk_prediction: Number,
  insights: [{ skill: String, importance: Number }]
});

module.exports = mongoose.model('Insight', InsightSchema);
