const express = require('express')
const { CognitiveResult } = require('../models')
const { client, mlError } = require('../services/ml')

const router = express.Router()
const level = (s) => (s >= 71 ? 'Good' : s >= 41 ? 'Moderate' : 'Low')
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)

// Save the game metrics and run the cognitive model in one step.
// (Previously: parents had to press "AUTISM" or "TD" to label their own child before predicting,
//  the node /predict route crashed because axios was never imported, and the browser called
//  the Flask app on 127.0.0.1:5021 directly.)
router.post('/analyze', async (req, res) => {
  const m = req.body || {}
  const features = {
    Fixation_Duration: num(m.fixationDuration),
    Gaze_Shift_Count: num(m.gazeShiftsCount),
    Attention_Score: num(m.attentionScore),
    Memory_Recall_Accuracy: num(m.accuracy),
    Response_Time: num(m.timeSpent),
    Memory_Score: num(m.memoryScore),
    Logical_Task_Completion_Time: num(m.totalTime),
    Logical_Task_Errors: num(m.errors),
    Logical_Score: num(m.score),
  }
  try {
    const { data } = await client().post('/cognitive/predict', { features })
    const levels = { attention: level(features.Attention_Score), memory: level(features.Memory_Score), logic: level(features.Logical_Score) }
    const saved = await CognitiveResult.create({
      userId: req.user._id,
      fixationDuration: features.Fixation_Duration,
      gazeShiftsCount: features.Gaze_Shift_Count,
      attentionScore: features.Attention_Score,
      accuracy: features.Memory_Recall_Accuracy,
      timeSpent: features.Response_Time,
      memoryScore: features.Memory_Score,
      totalTime: features.Logical_Task_Completion_Time,
      logicErrors: features.Logical_Task_Errors,
      score: features.Logical_Score,
      prediction: data.prediction,
      probability_autism: data.probability_autism,
      levels,
    })
    return res.json({ ...data, levels, _id: saved._id })
  } catch (err) {
    return mlError(res, err, 'Cognitive analysis failed')
  }
})

router.get('/results', async (req, res) => {
  res.json(await CognitiveResult.find({ userId: req.user._id }).sort({ createdAt: 1 }).lean())
})

module.exports = router
