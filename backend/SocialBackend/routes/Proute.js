// Proute.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Insight = mongoose.model('Insight', new mongoose.Schema({
  timestamp: Date,
  answers: [Number],
  sentiments: [Number],
  risk_prediction: Number,
  insights: [{ skill: String, importance: Number }]
}));

// Fetch all monthly insights
router.get('/insights', async (req, res) => {
  try {
    const insights = await Insight.find().sort({ timestamp: 1 }).exec();
    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
