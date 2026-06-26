const Chat = require('../models/Chat')
const { generateAnswer } = require('../services/chatService')

// @route POST /api/chat
const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body

    if (!message) {
      return res.status(400).json({ message: 'Message is required' })
    }

    // Get AI answer using RAG
    const { answer, sources } = await generateAnswer(message, req.user._id.toString())

    // Find existing chat or create new one
    let chat
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: req.user._id })
    }

    if (!chat) {
      chat = new Chat({
        user: req.user._id,
        title: message.substring(0, 50),
        messages: []
      })
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message
    })

    // Add assistant response with sources
    chat.messages.push({
      role: 'assistant',
      content: answer,
      sources
    })

    await chat.save()

    res.json({
      chatId: chat._id,
      answer,
      sources
    })

  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/chat/history
const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title updatedAt messages')

    res.json(chats)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route GET /api/chat/:id
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    res.json(chat)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { sendMessage, getChatHistory, getChat }