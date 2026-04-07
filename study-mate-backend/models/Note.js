const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: [
        'Computer Science',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Engineering',
        'Business',
        'Economics',
        'Literature',
        'History',
      ],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      uppercase: true,
    },
    fileSize: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

// Text index for search
noteSchema.index({ title: 'text', description: 'text', subject: 'text' })

module.exports = mongoose.model('Note', noteSchema)
