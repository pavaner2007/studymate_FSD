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
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getProfile, updateProfile }
