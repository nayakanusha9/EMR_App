import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import PhoneInput from '../components/PhoneInput';
import { DEFAULT_COUNTRY_CODE } from '../utils/constants';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    phone_country_code: DEFAULT_COUNTRY_CODE,
    profile_picture: user?.profile_picture || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await updateProfile({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        profile_picture: form.profile_picture || null,
      });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.updatePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Profile</h2>
          <p style={{ textTransform: 'capitalize' }}>{user?.role} account</p>
        </div>
      </div>

      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h3 className="card-title">Account Details</h3>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>
                Name
                <span className="required-asterisk"> *</span>
              </label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>
                Email
                <span className="required-asterisk"> *</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Phone Number</label>
              <PhoneInput
                countryCode={form.phone_country_code}
                phone={form.phone}
                onCountryChange={(v) => setForm({ ...form, phone_country_code: v })}
                onPhoneChange={(v) => setForm({ ...form, phone: v })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Profile Picture URL (optional)</label>
              <input
                value={form.profile_picture}
                onChange={(e) => setForm({ ...form, profile_picture: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">Change Password</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>
                Current Password
                <span className="required-asterisk"> *</span>
              </label>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>
                New Password
                <span className="required-asterisk"> *</span>
              </label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>
                Confirm New Password
                <span className="required-asterisk"> *</span>
              </label>
              <input
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
