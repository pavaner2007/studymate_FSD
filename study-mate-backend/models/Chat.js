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
  },
  { timestamps: true }
)

module.exports = mongoose.model('Chat', chatSchema)
