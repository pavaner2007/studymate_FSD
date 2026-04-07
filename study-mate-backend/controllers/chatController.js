const fs = require('fs')
const path = require('path')
const Groq = require('groq-sdk')
const pdfParse = require('pdf-parse')
const Chat = require('../models/Chat')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are Study Mate AI, a helpful academic assistant for college students. 
You help students understand their study materials, explain concepts clearly, and answer questions about their documents.
When a PDF is provided, base your answers on its content. Be concise, accurate, and educational.`

// @desc    Get all chats for current user
// @route   GET /api/chat
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .select('-pdfText -messages')
      .sort({ updatedAt: -1 })
    res.json(chats)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single chat with messages
// @route   GET /api/chat/:id
// @access  Private
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id }).select('-pdfText')
    if (!chat) return res.status(404).json({ message: 'Chat not found' })
    res.json(chat)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new chat
// @route   POST /api/chat
// @access  Private
const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({ user: req.user._id, title: 'New Chat', messages: [] })
    res.status(201).json(chat)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Upload PDF to a chat and extract text
// @route   POST /api/chat/:id/upload-pdf
// @access  Private
const uploadPdfToChat = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a PDF file' })

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id })
    if (!chat) {
      fs.unlinkSync(req.file.path)
      return res.status(404).json({ message: 'Chat not found' })
    }

    const pdfBuffer = fs.readFileSync(req.file.path)
    const pdfData = await pdfParse(pdfBuffer)
    fs.unlinkSync(req.file.path)

    const systemMessage = {
      role: 'system',
      content: `📄 PDF uploaded: "${req.file.originalname}" (${pdfData.numpages} pages). You can now ask questions about this document.`,
    }

    chat.pdfName = req.file.originalname
    chat.pdfText = pdfData.text.trim()
    chat.messages.push(systemMessage)
    await chat.save()

    res.json({
      message: 'PDF uploaded and processed successfully',
      pdfName: req.file.originalname,
      pages: pdfData.numpages,
      chatId: chat._id,
      systemMessage,
    })
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    res.status(500).json({ message: error.message })
  }
}

// @desc    Send a message and get AI response
// @route   POST /api/chat/:id/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body
    if (!content || !content.trim()) return res.status(400).json({ message: 'Message content is required' })

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id })
    if (!chat) return res.status(404).json({ message: 'Chat not found' })

    const userMessage = { role: 'user', content: content.trim() }
    chat.messages.push(userMessage)

    if (chat.title === 'New Chat') chat.title = content.trim().slice(0, 50)

    const conversationMessages = chat.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }))

    let systemContent = SYSTEM_PROMPT
    if (chat.pdfText) {
      systemContent += `\n\nThe student has uploaded a PDF document titled "${chat.pdfName}". Here is its content:\n\n${chat.pdfText.slice(0, 6000)}`
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemContent }, ...conversationMessages],
      temperature: 0.7,
      max_tokens: 1024,
    })

    const aiContent = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    const assistantMessage = { role: 'assistant', content: aiContent }
    chat.messages.push(assistantMessage)
    await chat.save()

    res.json({
      userMessage: { ...userMessage, _id: chat.messages.at(-2)._id },
      assistantMessage: { ...assistantMessage, _id: chat.messages.at(-1)._id },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a chat
// @route   DELETE /api/chat/:id
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!chat) return res.status(404).json({ message: 'Chat not found' })
    res.json({ message: 'Chat deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Remove PDF from a chat
// @route   DELETE /api/chat/:id/pdf
// @access  Private
const removePdfFromChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id })
    if (!chat) return res.status(404).json({ message: 'Chat not found' })

    chat.pdfName = null
    chat.pdfText = null
    chat.messages = chat.messages.filter((m) => m.role !== 'system')
    await chat.save()

    res.json({ message: 'PDF removed from chat' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getChats, getChatById, createChat, uploadPdfToChat, sendMessage, deleteChat, removePdfFromChat }
