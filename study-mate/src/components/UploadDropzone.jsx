import { useState, useCallback } from 'react'
import { Upload, FileText, X } from 'lucide-react'

function UploadDropzone({ onFileSelect, acceptedTypes = '.pdf,.ppt,.doc,.docx' }) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect?.(file)
    }
  }, [onFileSelect])

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      onFileSelect?.(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    onFileSelect?.(null)
  }

  return (
    <div>
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              isDragging ? 'bg-primary-100' : 'bg-slate-100'
            }`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-primary-600' : 'text-slate-400'}`} />
            </div>
            <p className="text-lg font-medium text-slate-700 mb-1">
              {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
            </p>
            <p className="text-sm text-slate-500 mb-3">
              or click to browse
            </p>
            <p className="text-xs text-slate-400">
              Supported formats: PDF, PPT, DOC (Max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadDropzone
