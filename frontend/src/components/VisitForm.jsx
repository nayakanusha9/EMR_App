import { useState } from 'react';
import { VISIT_FORM_FIELDS, emptyVisitForm, buildPayload, displayValue } from '../utils/patientForm';

export default function VisitForm({ patient, onSubmit, onCancel, submitting, error, submitLabel = 'Save Visit' }) {
  const [form, setForm] = useState(emptyVisitForm);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(buildPayload(form, VISIT_FORM_FIELDS));
  };

  return (
    <>
      {error && <div className="error-msg">{error}</div>}
      <div className="visit-patient-summary card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Patient Information (from previous visit)</h4>
        <div className="patient-card-details">
          <div><span className="label">Name</span> {displayValue(patient?.name)}</div>
          <div><span className="label">AMAX ID</span> {displayValue(patient?.amax_id)}</div>
          <div><span className="label">Age</span> {displayValue(patient?.age)}</div>
          <div><span className="label">Phone</span> {displayValue(patient?.phone)}</div>
          <div><span className="label">Email</span> {displayValue(patient?.email)}</div>
          <div><span className="label">Address</span> {displayValue(patient?.address)}</div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {VISIT_FORM_FIELDS.map(({ name, label, type, optional }) => (
            <div
              key={name}
              className="form-group"
              style={type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}
            >
              <label>{label}</label>
              {type === 'textarea' ? (
                <textarea name={name} value={form[name] ?? ''} onChange={handleChange} />
              ) : (
                <input
                  type={type}
                  name={name}
                  value={form[name] ?? ''}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          )}
        </div>
      </form>
    </>
  );
}
