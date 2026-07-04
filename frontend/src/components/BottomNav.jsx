import { NavLink } from 'react-router-dom';
import { CalendarClock, Users, Calendar, FileSearch } from 'lucide-react';

const tabs = [
  { to: '/schedule', icon: CalendarClock, label: "Today's Schedule" },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/clinical-search', icon: FileSearch, label: 'Clinical Search' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
