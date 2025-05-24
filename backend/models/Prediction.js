const mongoose = require('mongoose')

const predictionSchema = new mongoose.Schema({
  combined_confidence: Number,
  details: {
    behavior: {
      confidence: Number,
      prediction: String,
    },
    facial_expressions_recognition: {
      confidence: Number,
      prediction: String,
    },
    heatmap: {
      confidence: Number,
      prediction: String,
    },
  },
  final_prediction: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Prediction', predictionSchema)
