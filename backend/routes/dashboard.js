const express = require('express')
const M = require('../models')

const router = express.Router()

// One call for the dashboard overview: latest result + count per module.
router.get('/summary', async (req, res) => {
  const q = { userId: req.user._id }
  const latest = (Model, sort = { createdAt: -1 }) => Model.findOne(q).sort(sort).lean()
  const [behavioral, sensory, social, cognitive, nB, nS, nSo, nC, sessions] = await Promise.all([
    latest(M.BehavioralResult),
    latest(M.SensoryTest),
    latest(M.SocialResponse, { date: -1 }),
    latest(M.CognitiveResult),
    M.BehavioralResult.countDocuments(q),
    M.SensoryTest.countDocuments(q),
    M.SocialResponse.countDocuments(q),
    M.CognitiveResult.countDocuments(q),
    M.SensorySession.countDocuments(q),
  ])
  res.json({
    behavioral: { latest: behavioral, count: nB },
    sensory: { latest: sensory, count: nS, therapySessions: sessions },
    social: { latest: social, count: nSo },
    cognitive: { latest: cognitive, count: nC },
  })
})

module.exports = router
