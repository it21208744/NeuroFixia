const express = require('express')
const User = require('../models/User')
const { protect, signToken } = require('../middleware/auth')

const router = express.Router()
const emailRegex = /^\S+@\S+\.\S+$/

const authPayload = (user) => ({ ...user.toPublic(), token: signToken(user.id), loginTime: new Date().toISOString() })

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ message: 'Please fill in all fields' })
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Please provide a valid email address' })
  if (String(password).length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters long' })
  try {
    if (await User.findOne({ email: String(email).toLowerCase().trim() }))
      return res.status(400).json({ message: 'An account with this email already exists' })
    const user = await User.create({ name, email, password })
    return res.status(201).json(authPayload(user))
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
  // Bug fix: the original handler had no try/catch, so a DB error crashed the request.
  try {
    const user = await User.findOne({ email: String(email).toLowerCase().trim() })
    if (user && (await user.matchPassword(password))) return res.json(authPayload(user))
    return res.status(401).json({ message: 'Invalid email or password' })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
})

router.get('/me', protect, (req, res) => res.json(req.user.toPublic()))

router.put('/me', protect, async (req, res) => {
  const { name, child } = req.body || {}
  if (name) req.user.name = name
  if (child) req.user.child = { ...(req.user.child?.toObject?.() || {}), ...child }
  await req.user.save()
  res.json(req.user.toPublic())
})

module.exports = router
