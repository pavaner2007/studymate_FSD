import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Upload, MessageSquare, User } from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/chatbot', icon: MessageSquare, label: 'AI Chat' },
  { path: '/profile', icon: User, label: 'Profile' },
]

function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-50">
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-slate-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary-100' : ''}`}>
                  <item.icon size={20} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav
