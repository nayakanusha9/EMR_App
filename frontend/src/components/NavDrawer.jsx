import { NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  CalendarClock,
  Users,
  Calendar,
  FileSearch,
  Info,
  Share2,
  BookmarkPlus,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const drawerLinks = [
  { to: '/schedule', icon: CalendarClock, label: "Today's Schedule" },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/clinical-search', icon: FileSearch, label: 'Clinical Search' },
];

export default function NavDrawer({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="nav-drawer">
        <div className="nav-drawer-header">
          <div>
            <h2>EMR System</h2>
            <p>Electronic Medical Records</p>
          </div>
          <button type="button" className="app-bar-icon-btn drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="nav-drawer-profile">
          <div className="nav-drawer-avatar">{user?.full_name?.charAt(0) || 'U'}</div>
          <div>
            <div className="nav-drawer-name">{user?.full_name}</div>
            <div className="nav-drawer-email">{user?.email}</div>
          </div>
        </div>

        <nav className="nav-drawer-links">
          <NavLink to="/profile" className="nav-drawer-link" onClick={onClose}>
            <User size={18} /> Profile
          </NavLink>
          {drawerLinks.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className="nav-drawer-link" onClick={onClose}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <NavLink to="/about" className="nav-drawer-link" onClick={onClose}>
            <Info size={18} /> About
          </NavLink>
          <button
            type="button"
            className="nav-drawer-link"
            onClick={() => {
              if (navigator.share) navigator.share({ title: 'EMR System', url: window.location.origin });
              onClose();
            }}
          >
            <Share2 size={18} /> Share
          </button>
          <button
            type="button"
            className="nav-drawer-link"
            onClick={() => { alert('Shortcut added to your home screen preferences.'); onClose(); }}
          >
            <BookmarkPlus size={18} /> Add Shortcut
          </button>
        </nav>

        <div className="nav-drawer-footer">
          <button type="button" className="nav-drawer-link logout-link" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
