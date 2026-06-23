const Document = require('../models/Document')
const pdfParse = require('pdf-parse/lib/pdf-parse.js')
const cheerio = require('cheerio')
const axios = require('axios')

// Helper — clean up scraped text
const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ')       // collapse multiple spaces
    .replace(/\n+/g, '\n')      // collapse multiple newlines
    .trim()
}

// @route  POST /api/documents/upload-pdf
const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' })
    }

    // Extract text from PDF buffer
    const pdfData = await pdfParse(req.file.buffer)
    const rawText = cleanText(pdfData.text)

    if (!rawText || rawText.length < 50) {
      return res.status(400).json({ message: 'PDF appears to be empty or scanned image' })
    }

    const title = req.body.title || req.file.originalname.replace('.pdf', '')

    const document = await Document.create({
      user: req.user._id,
      title,
      type: 'pdf',
      rawText
    })

    res.status(201).json(document)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  POST /api/documents/add-url
const addURL = async (req, res) => {
  try {
    const { url, title } = req.body

    if (!url) {
      return res.status(400).json({ message: 'URL is required' })
    }

    // Fetch the webpage HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SecondBrain/1.0)'
      },
      timeout: 10000
    })

    // Load HTML into Cheerio
    const $ = cheerio.load(response.data)

    // Remove noise — scripts, styles, navigation
    $('script, style, nav, header, footer, aside, iframe').remove()

    // Extract main text content
    const rawText = cleanText($('body').text())

    if (!rawText || rawText.length < 100) {
      return res.status(400).json({ message: 'Could not extract meaningful content from this URL' })
    }

    // Use page title if no title provided
    const pageTitle = title || $('title').text() || url

    const document = await Document.create({
      user: req.user._id,
      title: pageTitle,
      type: 'url',
      sourceUrl: url,
      rawText
    })

    res.status(201).json(document)

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(400).json({ message: 'URL request timed out' })
    }
    res.status(500).json({ message: error.message })
  }
}

// @route  POST /api/documents/add-note
const addNote = async (req, res) => {
  try {
    const { title, content } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' })
    }

    const document = await Document.create({
      user: req.user._id,
      title,
      type: 'note',
      rawText: cleanText(content)
    })

    res.status(201).json(document)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  GET /api/documents
const getDocuments = async (req, res) => {
  try {
    // Only get documents belonging to logged in user
    const documents = await Document.find({ user: req.user._id })
      .select('-rawText')     // don't send full text — too heavy
      .sort({ createdAt: -1 })

    res.json(documents)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route  DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Make sure user owns this document
    if (document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this document' })
    }

    await document.deleteOne()
    res.json({ message: 'Document deleted' })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { uploadPDF, addURL, addNote, getDocuments, deleteDocument }