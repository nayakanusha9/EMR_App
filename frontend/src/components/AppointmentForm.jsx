import { useEffect, useState } from 'react';
import PhoneInput from './PhoneInput';
import {
  emptyForm,
  patientToForm,
  buildPayload,
} from '../utils/patientForm';
import { PATIENT_TYPES, APPOINTMENT_STATUSES } from '../utils/constants';

function renderField(field, form, handleChange) {
  const { name, label, type, required, optional } = field;

  if (type === 'country' || name === 'phone') return null;

  if (type === 'patient_type') {
    return (
      <div key={name} className="form-group">
        <label>{label}</label>
        <select name={name} value={form[name] ?? ''} onChange={handleChange}>
          <option value="">Select</option>
          {PATIENT_TYPES.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'appointment_status') {
    return (
      <div key={name} className="form-group">
        <label>{label}</label>
        <select name={name} value={form[name] ?? ''} onChange={handleChange}>
          <option value="">Select</option>
          {APPOINTMENT_STATUSES.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div
      key={name}
      className="form-group"
      style={type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}
    >
      <label>{label}{required && !optional ? ' *' : ''}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={form[name] ?? ''} onChange={handleChange} required={required && !optional} />
      ) : (
        <input
          type={type}
          name={name}
          value={form[name] ?? ''}
          onChange={handleChange}
          required={required && !optional}
          min={type === 'number' ? 0 : undefined}
        />
      )}
    </div>
  );
}

export default function AppointmentForm({
  isDoctor,
  patient,
  onSubmit,
  onCancel,
  submitting,
  error,
  submitLabel,
  defaultDate,
  formFields,
}) {
  const [form, setForm] = useState(() => ({
    ...emptyForm(formFields),
    ...(defaultDate ? { date: defaultDate } : {}),
    ...(patient ? patientToForm(patient) : {}),
  }));

  useEffect(() => {
    setForm({
      ...emptyForm(formFields),
      ...(defaultDate ? { date: defaultDate } : {}),
      ...(patient ? patientToForm(patient) : {}),
    });
  }, [patient, defaultDate, formFields]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(buildPayload(form, formFields));
  };

  const showPhone = formFields.some((f) => f.name === 'phone');

  return (
    <>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {formFields.map((field) => renderField(field, form, handleChange))}
          {showPhone && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Phone</label>
              <PhoneInput
                countryCode={form.phone_country_code}
                phone={form.phone}
                onCountryChange={(v) => setForm({ ...form, phone_country_code: v })}
                onPhoneChange={(v) => setForm({ ...form, phone: v })}
              />
            </div>
          )}
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
