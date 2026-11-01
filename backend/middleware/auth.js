const jwt = require('jsonwebtoken')
const User = require('../models/User')

const secret = () => process.env.JWT_SECRET || 'dev-only-secret-change-me'

const signToken = (id) => jwt.sign({ id }, secret(), { expiresIn: '30d' })

// Bug fix: the old middleware called next() and then also sent a 401 (headers sent twice),
// and accepted tokens for users that no longer exist.
async function protect(req, res, next) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised - please sign in' })
  }
  try {
    const decoded = jwt.verify(header.slice(7), secret())
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'Account not found - please sign in again' })
    req.user = user
    return next()
  } catch (err) {
    return res.status(401).json({ message: 'Session expired - please sign in again' })
  }
}

module.exports = { protect, signToken }
