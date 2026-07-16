import { useEffect, useState } from 'react';
import PhoneInput from './PhoneInput';
import { RequiredAsterisk } from './FormLabel';
import {
  emptyForm,
  patientToForm,
  buildPayload,
  DOCTOR_FORM_FIELDS,
  RECEPTIONIST_FORM_FIELDS,
} from '../utils/patientForm';

function renderField(field, form, handleChange) {
  const { name, label, type, required, optional } = field;
  if (type === 'country' || name === 'phone' || name === 'alternative_phone') return null;

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
          type={type === 'tel' ? 'tel' : type}
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

export default function PatientForm({
  isDoctor,
  patient,
  onSubmit,
  onCancel,
  submitting,
  error,
  submitLabel,
  defaultDate,
}) {
  const formFields = isDoctor ? DOCTOR_FORM_FIELDS : RECEPTIONIST_FORM_FIELDS;
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
  }, [patient, isDoctor, defaultDate, formFields]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(buildPayload(form, formFields));
  };

  return (
    <>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {formFields.map((field) => renderField(field, form, handleChange))}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Phone</label>
            <PhoneInput
              countryCode={form.phone_country_code}
              phone={form.phone}
              onCountryChange={(v) => setForm({ ...form, phone_country_code: v })}
              onPhoneChange={(v) => setForm({ ...form, phone: v })}
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Alternative Phone Number</label>
            <input
              type="tel"
              name="alternative_phone"
              value={form.alternative_phone ?? ''}
              onChange={handleChange}
            />
          </div>
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
