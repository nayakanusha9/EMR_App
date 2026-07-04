import { useNavigate } from 'react-router-dom';
import { CalendarClock, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  if (!isDoctor) {
    navigate('/patients', { replace: true });
    return null;
  }

  const cards = [
    {
      title: 'Appointments Today',
      icon: CalendarClock,
      description: 'View and manage today\'s appointments',
      onClick: () => navigate('/schedule?form=appointment'),
    },
    {
      title: "Today's Schedule",
      icon: CalendarDays,
      description: 'View and manage today\'s schedule',
      onClick: () => navigate('/schedule?form=schedule'),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Quick access to your daily workflow</p>
        </div>
      </div>

      <div className="dashboard-cards">
        {cards.map(({ title, icon: Icon, description, onClick }) => (
          <button key={title} type="button" className="dashboard-card" onClick={onClick}>
            <div className="dashboard-card-icon">
              <Icon size={32} />
            </div>
            <div className="dashboard-card-content">
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
