const express = require('express')
const axios = require('axios')
const router = express.Router()

// Predict endpoint
router.post('/predict', async (req, res) => {
  try {
    const { expressions } = req.body

    console.log('Request body sent to Flask:', req.body) // Log the request body

    const response = await axios.post(
      'http://localhost:5001/predict',
      {
        expressions,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    res.json({
      success: true,
      prediction: response.data.prediction,
      confidence: response.data.confidence,
    })
  } catch (error) {
    console.error('Error connecting to model:', error.message)
    res.status(500).json({ success: false, message: 'Model prediction failed' })
  }
})

module.exports = router
