const express = require('express')
const router = express.Router()
const {
  getNotes,
  getNoteById,
  uploadNote,
  downloadNote,
  deleteNote,
  getStats,
} = require('../controllers/noteController')
const { protect } = require('../middleware/authMiddleware')
const { uploadNote: uploadNoteMiddleware } = require('../middleware/uploadMiddleware')

router.get('/stats', getStats)
router.get('/', getNotes)
router.get('/:id', getNoteById)
router.post('/', protect, uploadNoteMiddleware.single('file'), uploadNote)
router.get('/:id/download', protect, downloadNote)
router.delete('/:id', protect, deleteNote)

module.exports = router
