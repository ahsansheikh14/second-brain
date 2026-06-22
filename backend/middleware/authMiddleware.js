const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    // Check if token exists in header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' })
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1]

    // Verify token — this will throw error if expired or invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user from token's ID, exclude password from result
    req.user = await User.findById(decoded.id).select('-password')

    // Move to next function
    next()

  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

module.exports = { protect }