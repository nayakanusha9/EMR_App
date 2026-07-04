import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, MoreVertical } from 'lucide-react';

export default function AppBar({ title, onMenuClick, showSearch = true }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/clinical-search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const menuItems = [
    { label: 'Profile', action: () => navigate('/profile') },
    { label: 'About', action: () => navigate('/about') },
    { label: 'Share', action: () => { if (navigator.share) navigator.share({ title: 'EMR System', url: window.location.origin }); } },
    { label: 'Add Shortcut', action: () => alert('Shortcut added to your home screen preferences.') },
  ];

  return (
    <header className="app-bar">
      <button type="button" className="app-bar-icon-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={22} />
      </button>

      {showSearch ? (
        <form className="app-bar-search" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      ) : (
        <h1 className="app-bar-title">{title}</h1>
      )}

      <div className="app-bar-actions" ref={menuRef}>
        <button
          type="button"
          className="app-bar-icon-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="More options"
        >
          <MoreVertical size={22} />
        </button>
        {menuOpen && (
          <div className="app-bar-dropdown">
            {menuItems.map(({ label, action }) => (
              <button key={label} type="button" onClick={() => { action(); setMenuOpen(false); }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
