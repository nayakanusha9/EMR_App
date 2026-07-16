import { useEffect, useState } from 'react';
import PhoneInput from './PhoneInput';
import { RequiredAsterisk } from './FormLabel';
import {
  emptyForm,
  patientToForm,
  buildPayload,
} from '../utils/patientForm';
import { DEFAULT_COUNTRY_CODE, PATIENT_TYPES, APPOINTMENT_STATUSES } from '../utils/constants';

function renderField(field, form, handleChange) {
  const { name, label, type, required, optional } = field;

  if (type === 'country' || name === 'phone' || name === 'alternative_phone') return null;

  if (type === 'patient_type') {
    return (
      <div key={name} className="form-group">
        <label>
          {label}
          <RequiredAsterisk required={required} optional={optional} />
        </label>
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
        <label>
          {label}
          <RequiredAsterisk required={required} optional={optional} />
        </label>
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
      <label>
        {label}
        <RequiredAsterisk required={required} optional={optional} />
      </label>
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
    alternative_phone_country_code: DEFAULT_COUNTRY_CODE,
    ...(defaultDate ? { date: defaultDate } : {}),
    ...(patient ? patientToForm(patient) : {}),
  }));

  useEffect(() => {
    setForm({
      ...emptyForm(formFields),
      alternative_phone_country_code: DEFAULT_COUNTRY_CODE,
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
  const showAlternativePhone = formFields.some((f) => f.name === 'alternative_phone');

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
          {showAlternativePhone && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Alternative Phone Number</label>
              <PhoneInput
                countryCode={form.alternative_phone_country_code}
                phone={form.alternative_phone}
                onCountryChange={(v) => setForm({ ...form, alternative_phone_country_code: v })}
                onPhoneChange={(v) => setForm({ ...form, alternative_phone: v })}
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
