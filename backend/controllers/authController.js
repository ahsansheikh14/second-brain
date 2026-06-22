const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash the password — never store plain text
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    // Return token + user info
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Return token + user info
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json(req.user)
}

module.exports = { registerUser, loginUser, getMe }