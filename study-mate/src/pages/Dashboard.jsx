import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, BookOpen, Users, TrendingUp, ArrowRight, Search, Loader2 } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import NoteCard from '../components/NoteCard'
import SearchBar from '../components/SearchBar'
import { useAuth } from '../context/AuthContext'
import { fetchNotes, fetchStats } from '../api/noteService'
import { subjects } from '../data/dummyData'

function Dashboard() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [notes, setNotes] = useState([])
  const [stats, setStats] = useState({ totalNotes: 0, subjects: 10, activeUsers: 0, totalDownloads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [notesRes, statsRes] = await Promise.all([
          fetchNotes({ limit: 4 }),
          fetchStats(),
        ])
        setNotes(notesRes.data.notes)
        setStats(statsRes.data)
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Client-side search filter on already-loaded notes
  const filteredNotes = searchQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-3xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-100">Ready to learn something new today? Browse notes or ask our AI.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/notes"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
            >
              <FileText size={18} />
              Browse Notes
            </Link>
            <Link
              to="/chatbot"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
            >
              <BookOpen size={18} />
              Ask AI
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={FileText} label="Total Notes" value={stats.totalNotes.toLocaleString()} color="primary" />
        <StatsCard icon={BookOpen} label="Subjects" value={stats.subjects} color="secondary" />
        <StatsCard icon={Users} label="Active Users" value={stats.activeUsers.toLocaleString()} color="green" />
        <StatsCard icon={TrendingUp} label="Downloads" value={stats.totalDownloads.toLocaleString()} color="orange" />
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full md:w-96">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search notes..." />
        </div>
        <Link
          to="/notes"
          className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
        >
          View all notes
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Recent Notes */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {searchQuery ? 'Search Results' : 'Recently Uploaded Notes'}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No notes found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search or browse all notes</p>
            <Link
              to="/notes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              Browse All Notes
            </Link>
          </div>
        )}
      </div>

      {/* Popular Subjects */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Popular Subjects</h2>
        <div className="flex flex-wrap gap-2">
          {subjects.slice(0, 8).map((subject, index) => (
            <Link
              key={subject}
              to={`/notes?subject=${encodeURIComponent(subject)}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                index % 2 === 0
                  ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  : 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100'
              }`}
            >
              {subject}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
