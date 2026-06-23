const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['pdf', 'url', 'note'],
      required: true
    },
    sourceUrl: {
      type: String,
      default: ''
    },
    rawText: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Document', documentSchema)