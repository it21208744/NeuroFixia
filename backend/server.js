require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const modelRoutes = require('./routes/modelRoutes')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

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
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: 'Processing failed' })
    }
  }
)

app.use('/api/users', userRoutes)
app.use('/api/models', modelRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
