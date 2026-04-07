const path = require('path')
const fs = require('fs')
const Note = require('../models/Note')

// @desc    Get all notes with search and filter
// @route   GET /api/notes
// @access  Public
const getNotes = async (req, res) => {
  try {
    const { search, subject, page = 1, limit = 20 } = req.query
    const query = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ]
    }

    if (subject) {
      query.subject = subject
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('uploadedBy', 'name avatar college')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Note.countDocuments(query),
    ])

    res.json({
      notes,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Public
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name avatar college')
    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }
    res.json(note)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Upload a new note
// @route   POST /api/notes
// @access  Private
const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' })
    }

    const { title, subject, description } = req.body

    if (!title || !subject) {
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ message: 'Title and subject are required' })
    }

    const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase()
    const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2)

    const note = await Note.create({
      title,
      subject,
      description: description || '',
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: ext === 'DOCX' ? 'DOC' : ext,
      fileSize: `${fileSizeMB} MB`,
      college: req.user.college || '',
      uploadedBy: req.user._id,
    })

    const populated = await note.populate('uploadedBy', 'name avatar college')

    res.status(201).json(populated)
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: error.message })
  }
}

// @desc    Download a note (increments download count)
// @route   GET /api/notes/:id/download
// @access  Private
const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    if (!fs.existsSync(note.filePath)) {
      return res.status(404).json({ message: 'File not found on server' })
    }

    await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } })

    res.download(note.filePath, note.fileName)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    if (note.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this note' })
    }

    if (fs.existsSync(note.filePath)) {
      fs.unlinkSync(note.filePath)
    }

    await note.deleteOne()

    res.json({ message: 'Note deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get platform stats
// @route   GET /api/notes/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    const [totalNotes, totalDownloadsResult, activeUsers] = await Promise.all([
      Note.countDocuments(),
      Note.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
      Note.distinct('uploadedBy'),
    ])

    res.json({
      totalNotes,
      subjects: 10,
      activeUsers: activeUsers.length,
      totalDownloads: totalDownloadsResult[0]?.total || 0,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getNotes, getNoteById, uploadNote, downloadNote, deleteNote, getStats }
