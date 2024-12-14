// server.js
const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const cors = require('cors')

dotenv.config()
connectDB()

const app = express()
app.use(express.json()) // Middleware to parse incoming JSON data
app.use(cors()) // Enable CORS

// Routes
app.use('/api/users', userRoutes)

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
