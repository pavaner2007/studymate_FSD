import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import UploadDropzone from '../components/UploadDropzone'
import { uploadNote } from '../api/noteService'
import { subjects } from '../data/dummyData'

function UploadNotes() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ title: '', subject: '', description: '', file: null })
  const [errors, setErrors] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.subject) newErrors.subject = 'Please select a subject'
    if (!formData.file) newErrors.file = 'Please upload a file'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsUploading(true)
    setServerError('')
    try {
      const data = new FormData()
      data.append('file', formData.file)
      data.append('title', formData.title)
      data.append('subject', formData.subject)
      data.append('description', formData.description)

      await uploadNote(data)
      setUploadSuccess(true)
      setTimeout(() => navigate('/notes'), 2000)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (file) => {
    setFormData((prev) => ({ ...prev, file }))
    if (file) setErrors((prev) => ({ ...prev, file: null }))
  }

  if (uploadSuccess) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-slate-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Successful!</h2>
          <p className="text-slate-500">Your notes have been uploaded successfully. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Upload Notes</h1>
        <p className="text-slate-500 mt-1">Share your study materials with your college</p>
      </div>

      {serverError && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle size={16} />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload File <span className="text-red-500">*</span>
          </label>
          <UploadDropzone onFileSelect={handleFileSelect} />
          {errors.file && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.file}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, title: e.target.value }))
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }))
            }}
            placeholder="e.g., Introduction to Machine Learning"
            className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.title ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.title}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.subject}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: null }))
            }}
            className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.subject ? 'border-red-300' : 'border-slate-200'}`}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          {errors.subject && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.subject}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Add a brief description of your notes..."
            rows={4}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
          />
        </div>

        <div className="bg-primary-50 rounded-2xl p-4">
          <h3 className="font-medium text-primary-800 mb-2">Upload Tips</h3>
          <ul className="text-sm text-primary-700 space-y-1">
            <li>• Make sure your file is in PDF, PPT, or DOC format</li>
            <li>• Keep the file size under 10MB</li>
            <li>• Include clear chapter headings in your notes</li>
            <li>• Add a descriptive title to help others find your notes</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload Notes
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default UploadNotes
