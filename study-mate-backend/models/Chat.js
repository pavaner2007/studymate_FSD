const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
  },
  { _id: true, timestamps: true }
)

const chatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Chat' },
    messages: [messageSchema],
    pdfName: { type: String, default: null },
    pdfText: { type: String, default: null },
    webUrl: { type: String, default: null },
    webTitle: { type: String, default: null },
    webContent: { type: String, default: null },
    youtubeUrl: { type: String, default: null },
    youtubeTitle: { type: String, default: null },
    youtubeTranscript: { type: String, default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Chat', chatSchema)
