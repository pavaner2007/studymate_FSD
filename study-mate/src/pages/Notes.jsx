import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, FileX, Loader2 } from 'lucide-react'
import NoteCard from '../components/NoteCard'
import SearchBar from '../components/SearchBar'
import { fetchNotes } from '../api/noteService'
import { subjects } from '../data/dummyData'

function Notes() {
  const [searchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [notes, setNotes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 50 }
      if (searchQuery) params.search = searchQuery
      if (selectedSubject) params.subject = selectedSubject
      const res = await fetchNotes(params)
      setNotes(res.data.notes)
      setTotal(res.data.total)
    } catch (err) {
      console.error('Failed to load notes', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedSubject])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => loadNotes(), 400)
    return () => clearTimeout(timer)
  }, [loadNotes])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSubject('')
  }

  const hasActiveFilters = searchQuery !== '' || selectedSubject !== ''

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Study Notes</h1>
          <p className="text-slate-500 mt-1">Browse and download notes from your college</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, subject, or description..."
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              showFilters || selectedSubject
                ? 'bg-primary-100 text-primary-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Filter size={18} />
            Filters
            {selectedSubject && (
              <span className="ml-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">1</span>
            )}
          </button>

          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubject('')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubject === '' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Subjects
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedSubject === subject ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {notes.length} of {total} notes
        </p>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Clear filters
          </button>
        )}
      </div>

      {/* Notes Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : notes.length > 0 ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'
          : 'space-y-4'
        }>
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileX className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No notes found</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            We couldn't find any notes matching your search. Try adjusting your filters or search query.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default Notes
