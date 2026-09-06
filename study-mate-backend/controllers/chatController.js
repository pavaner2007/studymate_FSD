const fs = require('fs')
const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')
const Groq = require('groq-sdk')
const pdfParse = require('pdf-parse')
const { fetchYoutubeTranscript } = require('../utils/youtubeTranscript')
const Chat = require('../models/Chat')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are Study Mate AI, a helpful academic assistant for college students. 
You help students understand their study materials, explain concepts clearly, and answer questions about their documents.
When a PDF or web page content is provided, base your answers strictly on that content. Be concise, accurate, and educational.`

// @desc    Get all chats for current user
// @route   GET /api/chat
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .select('-pdfText -webContent -messages')
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
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id }).select('-pdfText -webContent')
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

// @desc    Scrape a web page and load content into chat
// @route   POST /api/chat/:id/scrape
// @access  Private
const scrapeWebPage = async (req, res) => {
  try {
    const { url } = req.body
    if (!url || !url.trim()) {
      return res.status(400).json({ message: 'URL is required' })
    }

    // Validate URL format
    let parsedUrl
    try {
      parsedUrl = new URL(url.trim())
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ message: 'Only HTTP and HTTPS URLs are supported' })
      }
    } catch {
      return res.status(400).json({ message: 'Invalid URL format' })
    }

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id })
    if (!chat) return res.status(404).json({ message: 'Chat not found' })

    // Fetch the web page
    let html
    try {
      const response = await axios.get(url.trim(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15000,
        maxRedirects: 5,
      })
      html = response.data
    } catch (err) {
      return res.status(422).json({ message: `Could not fetch the web page: ${err.message}` })
    }

    // Parse and extract clean text using cheerio
    const $ = cheerio.load(html)

    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, iframe, noscript, svg, img, form, button, input, select, textarea, [class*="ad"], [id*="ad"], [class*="cookie"], [class*="popup"], [class*="modal"], [class*="banner"]').remove()

    // Extract page title
    const pageTitle = $('title').text().trim() || $('h1').first().text().trim() || parsedUrl.hostname

    // Extract main content — try common content containers first
    let mainText = ''
    const contentSelectors = ['main', 'article', '[role="main"]', '.content', '#content', '.post', '.article', '.entry-content', 'body']

    for (const selector of contentSelectors) {
      const el = $(selector)
      if (el.length) {
        mainText = el.text()
        if (mainText.trim().length > 200) break
      }
    }

    // Clean up whitespace
    const cleanText = mainText
      .replace(/\t/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ {2,}/g, ' ')
      .trim()

    if (cleanText.length < 100) {
      return res.status(422).json({ message: 'Could not extract meaningful content from this page. The page may require JavaScript or login.' })
    }

    // Truncate to fit within token limits (keep first 12000 chars)
    const truncatedContent = cleanText.slice(0, 12000)

    // Save to chat
    const systemMessage = {
      role: 'system',
      content: `🌐 Web page loaded: "${pageTitle}"\nURL: ${url.trim()}\nContent extracted successfully. You can now ask questions about this page.`,
    }

    chat.webUrl = url.trim()
    chat.webTitle = pageTitle
    chat.webContent = truncatedContent
    // Clear PDF context if switching to web
    chat.pdfName = null
    chat.pdfText = null
    chat.messages = chat.messages.filter(m => m.role !== 'system')
    chat.messages.push(systemMessage)
    if (chat.title === 'New Chat') chat.title = pageTitle.slice(0, 50)
    await chat.save()

    res.json({
      webUrl: url.trim(),
      webTitle: pageTitle,
      contentLength: truncatedContent.length,
      systemMessage: { ...systemMessage, _id: chat.messages.at(-1)._id },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Remove web content from a chat
// @route   DELETE /api/chat/:id/web
// @access  Private
const removeWebFromChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id })
    if (!chat) return res.status(404).json({ message: 'Chat not found' })

    chat.webUrl = null
    chat.webTitle = null
    chat.webContent = null
    chat.messages = chat.messages.filter(m => m.role !== 'system')
    await chat.save()

    res.json({ message: 'Web content removed from chat' })
  } catch (error) {
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
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }))

    // Build system prompt with context (PDF or Web)
    let systemContent = SYSTEM_PROMPT
    if (chat.pdfText) {
      systemContent += `\n\nThe student has uploaded a PDF document titled "${chat.pdfName}". Here is its content:\n\n${chat.pdfText.slice(0, 6000)}`
    } else if (chat.webContent) {
      systemContent += `\n\nThe student has provided a web page titled "${chat.webTitle}" (${chat.webUrl}). Here is the extracted content:\n\n${chat.webContent.slice(0, 6000)}`
    } else if (chat.youtubeTranscript) {
      systemContent += `\n\nThe student has provided a YouTube video titled "${chat.youtubeTitle}". Here is its transcript:\n\n${chat.youtubeTranscript.slice(0, 6000)}`
    }

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
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
    chat.messages = chat.messages.filter(m => m.role !== 'system')
    await chat.save()

    res.json({ message: 'PDF removed from chat' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Fetch YouTube transcript and summarize with Groq
// @route   POST /api/chat/:id/youtube
// @access  Private
const summarizeYoutube = async (req, res) => {
  try {
    const { url } = req.body
    if (!url || !url.trim()) return res.status(400).json({ message: 'YouTube URL is required' })

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id })
    if (!chat) return res.status(404).json({ message: 'Chat not found' })

    // Fetch transcript using utility
    let transcriptData
    try {
      transcriptData = await fetchYoutubeTranscript(url.trim())
    } catch (err) {
      return res.status(422).json({ message: err.message || 'Could not fetch transcript. The video may have captions disabled or is unavailable.' })
    }

    const { videoTitle, transcript: fullTranscript } = transcriptData
    const truncatedTranscript = fullTranscript.slice(0, 12000)

    // Summarize with Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are Study Mate AI, an academic assistant. Summarize the following YouTube video transcript in a clear, structured way for a college student. Include: key topics covered, main points, and important takeaways. Use bullet points and sections.',
        },
        {
          role: 'user',
          content: `Please summarize this YouTube video transcript:\n\n${truncatedTranscript}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    })

    const summary = completion.choices[0]?.message?.content || 'Could not generate summary.'

    const systemMessage = {
      role: 'system',
      content: `🎬 YouTube video loaded: "${videoTitle}"\nURL: ${url.trim()}\nTranscript extracted. You can now ask questions about this video.`,
    }
    const assistantMessage = {
      role: 'assistant',
      content: `## Video Summary\n\n${summary}`,
    }

    chat.youtubeUrl = url.trim()
    chat.youtubeTitle = videoTitle
    chat.youtubeTranscript = fullTranscript
    // Clear other contexts
    chat.pdfName = null
    chat.pdfText = null
    chat.webUrl = null
    chat.webTitle = null
    chat.webContent = null
    chat.messages = chat.messages.filter(m => m.role !== 'system')
    chat.messages.push(systemMessage)
    chat.messages.push(assistantMessage)
    if (chat.title === 'New Chat') chat.title = videoTitle.slice(0, 50)
    await chat.save()

    res.json({
      youtubeUrl: url.trim(),
      youtubeTitle: videoTitle,
      systemMessage: { ...systemMessage, _id: chat.messages.at(-2)._id },
      assistantMessage: { ...assistantMessage, _id: chat.messages.at(-1)._id },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Remove YouTube video from a chat
// @route   DELETE /api/chat/:id/youtube
// @access  Private
const removeYoutubeFromChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id })
    if (!chat) return res.status(404).json({ message: 'Chat not found' })

    chat.youtubeUrl = null
    chat.youtubeTitle = null
    chat.youtubeTranscript = null
    chat.messages = chat.messages.filter(m => m.role !== 'system')
    await chat.save()

    res.json({ message: 'YouTube video removed from chat' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getChats, getChatById, createChat,
  uploadPdfToChat, sendMessage, deleteChat, removePdfFromChat,
  scrapeWebPage, removeWebFromChat,
  summarizeYoutube, removeYoutubeFromChat,
}
