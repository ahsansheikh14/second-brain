const express = require('express')
const router = express.Router()
const { sendMessage, getChatHistory, getChat } = require('../controllers/chatController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.post('/', sendMessage)
router.get('/history', getChatHistory)
router.get('/:id', getChat)

module.exports = router