import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Profile</h2>
          <p>Your account information</p>
        </div>
      </div>
      <div className="card">
        <div className="detail-list">
          <div className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">{user?.full_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{user?.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Role</span>
            <span className="detail-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
