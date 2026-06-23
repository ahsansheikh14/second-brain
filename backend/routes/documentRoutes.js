const express = require('express')
const router = express.Router()
const {
  uploadPDF,
  addURL,
  addNote,
  getDocuments,
  deleteDocument
} = require('../controllers/documentController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../config/multer')

// All routes protected
router.use(protect)

router.post('/upload-pdf', upload.single('pdf'), uploadPDF)
router.post('/add-url', addURL)
router.post('/add-note', addNote)
router.get('/', getDocuments)
router.delete('/:id', deleteDocument)

module.exports = router