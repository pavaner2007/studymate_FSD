import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Building, Calendar, Edit2, FileText, Download, Save, X, Loader2 } from 'lucide-react'
import NoteCard from '../components/NoteCard'
import { fetchProfile, updateProfile } from '../api/userService'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, updateUser } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [userNotes, setUserNotes] = useState([])
  const [profileStats, setProfileStats] = useState({ notesUploaded: 0, totalDownloads: 0 })
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', bio: '', college: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchProfile()
        setProfileData(res.data.user)
        setUserNotes(res.data.notes)
        setProfileStats(res.data.stats)
        setEditData({
          name: res.data.user.name,
          bio: res.data.user.bio,
          college: res.data.user.college,
        })
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const res = await updateProfile(editData)
      setProfileData(res.data)
      updateUser(res.data)
      setIsEditing(false)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  const display = profileData || user

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-600"></div>

        <div className="px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 relative">
            <div className="relative">
              <img
                src={display?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${display?.name}`}
                alt={display?.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-xl shadow-lg hover:bg-primary-700 transition-colors">
                <Edit2 size={16} />
              </button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold"
                  />
                  <input
                    type="text"
                    value={editData.college}
                    onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                    placeholder="College name"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  {saveError && <p className="text-sm text-red-500">{saveError}</p>}
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{display?.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-500">
                    <div className="flex items-center gap-1">
                      <Building size={16} />
                      {display?.college || 'No college set'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail size={16} />
                      {display?.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Joined {formatDate(display?.joinedDate || display?.createdAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsEditing(false); setSaveError('') }}
                  className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h2 className="text-sm font-medium text-slate-500 mb-2">About</h2>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                rows={3}
                placeholder="Tell others about yourself..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl resize-none"
              />
            ) : (
              <p className="text-slate-700">{display?.bio || 'No bio added yet.'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-100 rounded-xl">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{profileStats.notesUploaded}</p>
              <p className="text-sm text-slate-500">Notes Uploaded</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-secondary-100 rounded-xl">
              <Download className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{profileStats.totalDownloads}</p>
              <p className="text-sm text-slate-500">Total Downloads</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">1</p>
              <p className="text-sm text-slate-500">Subjects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{profileStats.notesUploaded}</p>
              <p className="text-sm text-slate-500">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Notes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">My Uploaded Notes</h2>
          <Link to="/upload" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            Upload More
          </Link>
        </div>

        {userNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {userNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No notes uploaded yet</h3>
            <p className="text-slate-500 mb-4">Start sharing your study materials with your college</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              Upload Your First Note
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
