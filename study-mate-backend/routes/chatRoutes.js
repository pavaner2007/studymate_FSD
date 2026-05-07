const express = require('express')
const router = express.Router()
const {
  getChats, getChatById, createChat,
  uploadPdfToChat, sendMessage, deleteChat, removePdfFromChat,
  scrapeWebPage, removeWebFromChat,
  summarizeYoutube, removeYoutubeFromChat,
} = require('../controllers/chatController')
const { protect } = require('../middleware/authMiddleware')
const { uploadPdf } = require('../middleware/uploadMiddleware')

router.get('/', protect, getChats)
router.post('/', protect, createChat)
router.get('/:id', protect, getChatById)
router.delete('/:id', protect, deleteChat)
router.post('/:id/upload-pdf', protect, uploadPdf.single('pdf'), uploadPdfToChat)
router.post('/:id/message', protect, sendMessage)
router.delete('/:id/pdf', protect, removePdfFromChat)
router.post('/:id/scrape', protect, scrapeWebPage)
router.delete('/:id/web', protect, removeWebFromChat)
router.post('/:id/youtube', protect, summarizeYoutube)
router.delete('/:id/youtube', protect, removeYoutubeFromChat)

module.exports = router
