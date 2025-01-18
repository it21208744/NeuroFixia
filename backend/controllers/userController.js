const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  // Check if all fields are present
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' })
  }

  // Validate email format
  const emailRegex = /^\S+@\S+\.\S+$/
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: 'Please provide a valid email address' })
  }

  // Validate password length
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters long' })
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create the user
    const user = await User.create({ name, email, password })

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id),
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (user && (await bcrypt.compare(password, user.password))) {
    const loginTime = new Date().toISOString()
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
      loginTime,
    })
  } else {
    res.status(401).json({ message: 'Invalid credentials' })
  }
}

const getMe = async (req, res) => {
  res.status(200).json(req.user)
}

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

module.exports = { registerUser, loginUser, getMe }
