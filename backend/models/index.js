/* All assessment / activity records are scoped to the signed-in parent account (userId). */
const mongoose = require('mongoose')
const { Schema } = mongoose
const owner = { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }

const modality = new Schema(
  { prediction: String, confidence: Number, note: String, answers: [String] },
  { _id: false }
)

const BehavioralResult = mongoose.model(
  'BehavioralResult',
  new Schema(
    {
      userId: owner,
      final_prediction: String,
      combined_confidence: Number,
      modalities_used: [String],
      expressions: [String],
      gazePoints: Number,
      details: {
        behavior: modality,
        heatmap: modality,
        facial_expressions_recognition: modality,
      },
    },
    { timestamps: true }
  )
)

const ExpressionGameScore = mongoose.model(
  'ExpressionGameScore',
  new Schema({ userId: owner, correct: Number, total: Number, seconds: Number }, { timestamps: true })
)

const SensoryTest = mongoose.model(
  'SensoryTest',
  new Schema(
    {
      userId: owner,
      age: Number,
      noise: String,
      final_prediction: String,
      pose_prediction: String,
      confidence_hypersensitivity: Number,
      dominant_emotion: String,
      distress_level: Number,
      reaction_features: Schema.Types.Mixed,
    },
    { timestamps: true }
  )
)

const SensorySession = mongoose.model(
  'SensorySession',
  new Schema(
    {
      userId: owner,
      sound: { type: String, required: true },
      volume: { type: Number, required: true, min: 0, max: 1 },
      duration: { type: Number, required: true, min: 0 },
    },
    { timestamps: true }
  )
)

const SocialProfile = mongoose.model(
  'SocialProfile',
  new Schema(
    { userId: owner, age: String, gender: String, lang: String },
    { timestamps: true }
  )
)

const SocialResponse = mongoose.model(
  'SocialResponse',
  new Schema(
    {
      userId: owner,
      lang: String,
      q1: String, q2: String, q3: String, q4: String, q5: String,
      q6: String, q7: String, q8: String, q9: String, q10: String,
      risk_prediction: String,
      risk_probability: Number,
      sentiment_q9: Number,
      sentiment_q10: Number,
      important_negative_responses: [String],
      importance_scores: { type: Map, of: Number },
      top_3_features: [{ feature: String, label: String, score_percent: Number, _id: false }],
      date: { type: Date, default: Date.now },
    },
    { timestamps: true }
  )
)

const SimonScore = mongoose.model(
  'SimonScore',
  new Schema({ userId: owner, finalScore: Number, currentLevel: String }, { timestamps: true })
)

const CognitiveResult = mongoose.model(
  'CognitiveResult',
  new Schema(
    {
      userId: owner,
      fixationDuration: Number,
      gazeShiftsCount: Number,
      attentionScore: Number,
      accuracy: Number,
      timeSpent: Number,
      memoryScore: Number,
      totalTime: Number,
      logicErrors: Number, // "errors" is a reserved mongoose path (original schema crashed)
      score: Number,
      prediction: Number,
      probability_autism: Number,
      levels: { attention: String, memory: String, logic: String },
    },
    { timestamps: true }
  )
)

module.exports = {
  BehavioralResult,
  ExpressionGameScore,
  SensoryTest,
  SensorySession,
  SocialProfile,
  SocialResponse,
  SimonScore,
  CognitiveResult,
}
