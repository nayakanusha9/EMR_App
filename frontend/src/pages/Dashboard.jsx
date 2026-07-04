import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarClock } from 'lucide-react';
import { dashboardAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.stats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  const cards = [
    { label: 'Total Patients', value: stats.total_patients, icon: Users },
    { label: 'Registered Today', value: stats.registered_today, icon: Users },
    { label: 'Pending Follow Up 1', value: stats.pending_follow_up_1, icon: CalendarClock },
    { label: 'Pending Follow Up 2', value: stats.pending_follow_up_2, icon: CalendarClock },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your EMR system</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">{label}</span>
              <Icon size={20} color="var(--primary)" />
            </div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Recently Registered Patients</div>
        {stats.recent_patients.length === 0 ? (
          <div className="empty-state">No patients registered yet.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>SL NO</th>
                  <th>AMAX ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Phone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_patients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.sl_no}</td>
                    <td>{p.amax_id}</td>
                    <td>{p.name}</td>
                    <td>{p.date}</td>
                    <td>{p.phone || '—'}</td>
                    <td>
                      <Link to="/patients" className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
