const router = require('express').Router()
const axios = require('axios') // For making HTTP requests to the Flask app
let social = require('../models/Smod')

// Route to add social data and perform analysis
router.route('/analyze').post(async (req, res) => {
  try {
    const { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 } = req.body
    console.log('Heheeee')

    const sentimentResponse = await axios.post(
      'http://192.168.1.5:5001/sentiment',
      {
        q9: q9,
        q10: q10,
      }
    )

    const sentiment_q9 = sentimentResponse.data.sentiment_q9
    const sentiment_q10 = sentimentResponse.data.sentiment_q10

    const riskResponse = await axios.post(
      'http://192.168.1.5:5001/risk-prediction',
      {
        yes_no_answers: [q1, q2, q3, q4, q5, q6, q7, q8],
        sentiment_q9: sentiment_q9,
        sentiment_q10: sentiment_q10,
      }
    )

    const riskPrediction = riskResponse.data.risk_prediction

    // Additional data if risk is detected
    const important_negatives =
      riskResponse.data.important_negative_responses || []
    const importance_scores = riskResponse.data.importance_scores || {}
    const top_3_features = riskResponse.data.top_3_features || []

    const newSocial = new social({
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8,
      q9,
      q10,
      risk_prediction:
        riskPrediction === 1 ? 'Risk Detected' : 'No Risk Detected',
      important_negative_responses: important_negatives,
      importance_scores: importance_scores,
      top_3_features: top_3_features, // New field
      date: new Date(),
    })
    await newSocial.save()

    res.json({ risk_prediction: riskPrediction })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Route to get all social data
router.route('/').get((req, res) => {
  social
    .find()
    .then((Sroute) => res.json(Sroute))
    .catch((err) => res.status(500).json({ error: err.message }))
})

// Route to update social data
router.route('/update/:id').put(async (req, res) => {
  const questionId = req.params.id
  const { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 } = req.body

  const updateSocial = { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 }

  social
    .findByIdAndUpdate(questionId, updateSocial)
    .then(() => res.status(200).send({ status: 'Updated' }))
    .catch((err) =>
      res
        .status(500)
        .send({ status: 'Error updating data', error: err.message })
    )
})

// Route to delete social data
router.route('/delete/:id').delete(async (req, res) => {
  const questionId = req.params.id
  social
    .findByIdAndDelete(questionId)
    .then(() => res.status(200).send({ status: 'Deleted' }))
    .catch((err) =>
      res
        .status(500)
        .send({ status: 'Error deleting data', error: err.message })
    )
})

// Route to get a specific social data entry
router.route('/get/:id').get(async (req, res) => {
  const questionId = req.params.id
  social
    .findById(questionId)
    .then((social) => res.status(200).send({ status: 'Fetched', social }))
    .catch((err) =>
      res
        .status(500)
        .send({ status: 'Error fetching data', error: err.message })
    )
})

module.exports = router
