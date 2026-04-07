const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure uploads directories exist
const notesUploadDir = path.join(__dirname, '..', 'uploads', 'notes')
const pdfUploadDir = path.join(__dirname, '..', 'uploads', 'pdfs')

if (!fs.existsSync(notesUploadDir)) fs.mkdirSync(notesUploadDir, { recursive: true })
if (!fs.existsSync(pdfUploadDir)) fs.mkdirSync(pdfUploadDir, { recursive: true })

// Storage for notes
const notesStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, notesUploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

// Storage for chat PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pdfUploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const notesFileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(Object.assign(new Error('Only PDF, DOC, DOCX, PPT, PPTX files are allowed'), { code: 'INVALID_FILE_TYPE' }))
  }
}

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(Object.assign(new Error('Only PDF files are allowed for chat'), { code: 'INVALID_FILE_TYPE' }))
  }
}

const uploadNote = multer({
  storage: notesStorage,
  fileFilter: notesFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

module.exports = { uploadNote, uploadPdf }
