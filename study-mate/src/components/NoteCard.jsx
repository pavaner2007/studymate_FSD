import { useState } from 'react'
import { FileText, Download, Calendar, User, Loader2 } from 'lucide-react'
import { downloadNote } from '../api/noteService'

function NoteCard({ note }) {
  const [downloading, setDownloading] = useState(false)

  const getFileColor = (fileType) => {
    const colors = {
      PDF: 'bg-red-100 text-red-600',
      PPT: 'bg-orange-100 text-orange-600',
      DOC: 'bg-blue-100 text-blue-600',
    }
    return colors[fileType] || 'bg-slate-100 text-slate-600'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await downloadNote(note._id || note.id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', note.fileName || `${note.title}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const uploader = note.uploadedBy

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card card-hover border border-slate-100">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate mb-1">{note.title}</h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${getFileColor(note.fileType)}`}>
            <FileText className="w-3 h-3" />
            {note.fileType}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
          {note.subject}
        </span>
      </div>

      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{note.description}</p>

      <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
        <div className="flex items-center gap-1">
          <User size={14} />
          <span>{uploader?.name || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{formatDate(note.uploadedAt || note.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500">{note.fileSize}</span>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {downloading ? 'Downloading...' : 'Download'}
        </button>
      </div>
    </div>
  )
}

export default NoteCard
