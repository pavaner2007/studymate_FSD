const express = require('express')
const router = express.Router()
const { getProfile, updateProfile, toggleBookmark, getBookmarks } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.get('/bookmarks', protect, getBookmarks)
router.post('/bookmarks/:noteId', protect, toggleBookmark)

module.exports = router
