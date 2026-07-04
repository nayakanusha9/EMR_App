import { useEffect, useState } from 'react';
import {
  emptyForm,
  patientToForm,
  buildPayload,
  DOCTOR_FORM_FIELDS,
  RECEPTIONIST_FORM_FIELDS,
} from '../utils/patientForm';

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
    ...emptyForm(isDoctor),
    ...(defaultDate ? { date: defaultDate } : {}),
    ...(patient ? patientToForm(patient) : {}),
  }));

  useEffect(() => {
    setForm({
      ...emptyForm(isDoctor),
      ...(defaultDate ? { date: defaultDate } : {}),
      ...(patient ? patientToForm(patient) : {}),
    });
  }, [patient, isDoctor, defaultDate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(buildPayload(form, isDoctor));
  };

  return (
    <>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {formFields.map(({ name, label, type, required }) => (
            <div
              key={name}
              className="form-group"
              style={type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}
            >
              <label>{label}{required ? ' *' : ''}</label>
              {type === 'textarea' ? (
                <textarea
                  name={name}
                  value={form[name] ?? ''}
                  onChange={handleChange}
                  required={required}
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  value={form[name] ?? ''}
                  onChange={handleChange}
                  required={required}
                  min={type === 'number' ? 0 : undefined}
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
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}
