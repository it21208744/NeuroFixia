require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const cors = require('cors')

const app = express()
connectDB()

app.use(express.json())
app.use(cors())
// app.use(express.urlencoded({ extended: false }))

app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
