const User = require('../models/User')
const Note = require('../models/Note')

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const userNotes = await Note.find({ uploadedBy: req.user._id }).populate('uploadedBy', 'name avatar college')
    const totalDownloads = userNotes.reduce((acc, note) => acc + note.downloads, 0)

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        bio: user.bio,
        avatar: user.avatar,
        joinedDate: user.createdAt,
        bookmarks: user.bookmarks,
      },
      stats: {
        notesUploaded: userNotes.length,
        totalDownloads,
      },
      notes: userNotes,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, college } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, college },
      { new: true, runValidators: true }
    )

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      bio: user.bio,
      avatar: user.avatar,
      joinedDate: user.createdAt,
      bookmarks: user.bookmarks,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Toggle bookmark on a note
// @route   POST /api/users/bookmarks/:noteId
// @access  Private
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const noteId = req.params.noteId
    const isBookmarked = user.bookmarks.some(id => id.toString() === noteId)

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== noteId)
    } else {
      user.bookmarks.push(noteId)
    }
    await user.save()

    res.json({ bookmarked: !isBookmarked, bookmarks: user.bookmarks })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all bookmarked notes
// @route   GET /api/users/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'uploadedBy', select: 'name avatar college' },
    })
    res.json(user.bookmarks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getProfile, updateProfile, toggleBookmark, getBookmarks }
