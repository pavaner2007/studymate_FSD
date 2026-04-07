import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  MessageSquare, 
  User, 
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/chatbot', icon: MessageSquare, label: 'AI Chat' },
  { path: '/profile', icon: User, label: 'Profile' },
]

function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <span className="font-bold text-xl text-slate-800">Study Mate</span>
          )}
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200">
        <button className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 w-full transition-colors ${!isOpen && 'justify-center'}`}>
          <Settings className="w-5 h-5" />
          {isOpen && <span className="font-medium">Settings</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
