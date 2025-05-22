require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const modelRoutes = require('./routes/modelRoutes')
const axios = require('axios')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const FormData = require('form-data')

const app = express()
connectDB()

app.use(express.json())
app.use(cors())

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage: storage })

// Function to clean up the uploads directory
const cleanupUploads = () => {
  const directory = 'uploads'
  fs.readdir(directory, (err, files) => {
    if (err) throw err

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err
      })
    }
  })
}

// Unified route to handle video, image, and form data
app.post(
  '/api/upload-all',
  upload.fields([{ name: 'video' }, { name: 'image' }]),
  async (req, res) => {
    try {
      const videoPath = req.files['video']
        ? path.join(__dirname, 'uploads', req.files['video'][0].filename)
        : null
      const imagePath = req.files['image']
        ? path.join(__dirname, 'uploads', req.files['image'][0].filename)
        : null
      const formData = req.body

      console.log('Video Path:', videoPath)
      console.log('Image Path:', imagePath)
      console.log('Form Data:', formData)

      res.json({
        success: true,
        message: 'Data received successfully',
        videoPath,
        imagePath,
        formData,
      })

      // Cleanup uploaded files
      if (videoPath) fs.unlinkSync(videoPath)
      if (imagePath) fs.unlinkSync(imagePath)
      cleanupUploads() // Cleanup the uploads directory
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: 'Processing failed' })
    }
  }
)

app.post('/api/analyze-video', upload.single('video'), async (req, res) => {
  try {
    console.log('Uploaded File:', req.file) // Log the uploaded file object
    const videoPath = path.resolve(req.file.path).replace(/\\/g, '/')
    console.log('Absolute Video Path:', videoPath) // Log the absolute path

    // Call the Python API
    const pythonApiResponse = await axios.post(
      'http://127.0.0.1:5002/predict-behavior',
      {
        video_path: videoPath,
      }
    )

    // Cleanup uploaded file
    fs.unlinkSync(videoPath)
    cleanupUploads() // Cleanup the uploads directory

    // Send the response from the Python API back to the client
    res.json(pythonApiResponse.data)
  } catch (error) {
    console.error('Error:', error) // Log the full error
    res.status(500).json({ error: 'Failed to analyze video' })
  }
})

app.post('/api/analyze-heatmap', upload.single('image'), async (req, res) => {
  try {
    console.log('Uploaded File:', req.file) // Log the uploaded file object
    const imagePath = path.resolve(req.file.path).replace(/\\/g, '/')
    console.log('Absolute Image Path:', imagePath) // Log the absolute path

    // Call the Python API
    const pythonApiResponse = await axios.post(
      'http://127.0.0.1:5002/predict-heatmap',
      {
        image_path: imagePath,
      }
    )

    // Cleanup uploaded file
    fs.unlinkSync(imagePath)
    cleanupUploads() // Cleanup the uploads directory

    // Send the response from the Python API back to the client
    res.json(pythonApiResponse.data)
  } catch (error) {
    console.error('Error:', error) // Log the full error
    res.status(500).json({ error: 'Failed to analyze image' })
  }
})

app.post('/api/analyze-asd', async (req, res) => {
  try {
    const expressions = req.body.expressions
    console.log('Expressions:', expressions) // Log the expressions

    // Call the Python API
    const pythonApiResponse = await axios.post(
      'http://127.0.0.1:5002/predict-asd',
      {
        expressions: expressions,
      }
    )

    // Send the response from the Python API back to the client
    res.json(pythonApiResponse.data)
  } catch (error) {
    console.error('Error:', error) // Log the full error
    res.status(500).json({ error: 'Failed to analyze expressions' })
  }
})

app.post(
  '/api/analyze-combined',
  upload.fields([{ name: 'video' }, { name: 'image' }]),
  async (req, res) => {
    try {
      const expressions = req.body.expressions
        ? JSON.parse(req.body.expressions).map((expr) =>
            expr.replace(/"/g, "'")
          )
        : null

      console.log('Expressions:', expressions)

      // Create a FormData object and append expressions only
      const formData = new FormData()

      if (expressions) {
        formData.append('expressions', JSON.stringify(expressions))
      }

      // Send only expressions to the Python API
      const pythonApiResponse = await axios.post(
        'http://127.0.0.1:5002/predict-combined',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      )

      res.json(pythonApiResponse.data)
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Failed to analyze expressions' })
    }
  }
)

app.use('/api/users', userRoutes)
app.use('/api/models', modelRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
