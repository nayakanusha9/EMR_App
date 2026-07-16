import { DEFAULT_COUNTRY_CODE } from './constants';

export const RECEPTIONIST_FORM_FIELDS = [
  { name: 'amax_id', label: 'AMAX ID', type: 'text', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'phone_country_code', label: 'Country Code', type: 'country', required: false },
  { name: 'phone', label: 'Phone', type: 'tel', required: false },
  { name: 'alternative_phone', label: 'Alternative Phone Number', type: 'tel', required: false, optional: true },
  { name: 'email', label: 'Email', type: 'email', required: false, optional: true },
  { name: 'address', label: 'Address', type: 'textarea', required: false },
  { name: 'follow_up_1', label: 'Follow Up 1', type: 'text', required: false },
  { name: 'follow_up_2', label: 'Follow Up 2', type: 'text', required: false },
];

export const DOCTOR_FORM_FIELDS = [
  ...RECEPTIONIST_FORM_FIELDS.slice(0, 9),
  { name: 'follow_up_1', label: 'FU 1', type: 'text', required: false },
  { name: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: false },
  { name: 'laterality', label: 'Laterality', type: 'text', required: false },
  { name: 'treatment', label: 'Treatment', type: 'textarea', required: false },
  { name: 'status', label: 'Status', type: 'text', required: false },
  { name: 'finance', label: 'Finance', type: 'text', required: false },
  { name: 'remark_1', label: 'Remark (FU 1)', type: 'textarea', required: false },
  { name: 'follow_up_2', label: 'FU 2', type: 'text', required: false },
  { name: 'remark_2', label: 'Remark (FU 2)', type: 'textarea', required: false },
  { name: 'referral', label: 'Referral', type: 'text', required: false },
];

export const APPOINTMENT_FORM_FIELDS = [
  { name: 'amax_id', label: 'AMAX ID', type: 'text', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'appointment_time', label: 'Appointment Time', type: 'time', required: false },
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'phone_country_code', label: 'Country Code', type: 'country', required: false },
  { name: 'phone', label: 'Phone', type: 'tel', required: false },
  { name: 'email', label: 'Email', type: 'email', required: false, optional: true },
  { name: 'address', label: 'Address', type: 'textarea', required: false },
  { name: 'patient_type', label: 'Patient Type', type: 'patient_type', required: false },
  { name: 'appointment_status', label: 'Status', type: 'appointment_status', required: false },
];

export const DOCTOR_APPOINTMENT_FORM_FIELDS = [
  ...APPOINTMENT_FORM_FIELDS,
  { name: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: false },
  { name: 'laterality', label: 'Laterality', type: 'text', required: false },
  { name: 'treatment', label: 'Treatment', type: 'textarea', required: false },
];

export const VISIT_FORM_FIELDS = [
  { name: 'visit_date', label: 'Visit Date', type: 'date', required: false, optional: true },
  { name: 'visit_time', label: 'Visit Time', type: 'time', required: false, optional: true },
  { name: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: false },
  { name: 'prescription', label: 'Prescription', type: 'textarea', required: false },
  { name: 'notes', label: 'Notes', type: 'textarea', required: false },
  { name: 'follow_up_remarks', label: 'Follow-up Remarks', type: 'textarea', required: false },
];

export function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function emptyVisitForm() {
  return {
    visit_date: todayISO(),
    visit_time: currentTime(),
    diagnosis: '',
    prescription: '',
    notes: '',
    follow_up_remarks: '',
  };
}

export function emptyForm(fields) {
  return fields.reduce((acc, { name }) => {
    acc[name] = name === 'phone_country_code' ? DEFAULT_COUNTRY_CODE : '';
    return acc;
  }, {});
}

export function patientToForm(patient) {
  if (!patient) return {};
  return {
    amax_id: patient.amax_id ?? '',
    date: patient.date ?? '',
    name: patient.name ?? '',
    age: patient.age ?? '',
    phone: patient.phone ?? '',
    phone_country_code: patient.phone_country_code ?? DEFAULT_COUNTRY_CODE,
    alternative_phone: patient.alternative_phone ?? '',
    email: patient.email ?? '',
    address: patient.address ?? '',
    appointment_time: patient.appointment_time ?? '',
    patient_type: patient.patient_type ?? '',
    appointment_status: patient.appointment_status ?? '',
    follow_up_1: patient.follow_up_1 ?? '',
    follow_up_2: patient.follow_up_2 ?? '',
    diagnosis: patient.diagnosis ?? '',
    laterality: patient.laterality ?? '',
    treatment: patient.treatment ?? '',
    status: patient.status ?? '',
    finance: patient.finance ?? '',
    remark_1: patient.remark_1 ?? '',
    remark_2: patient.remark_2 ?? '',
    referral: patient.referral ?? '',
  };
}

export function buildPayload(form, fields) {
  const payload = {};
  for (const { name, type } of fields) {
    const value = form[name];
    if (type === 'number') {
      payload[name] = value === '' ? undefined : Number(value);
    } else {
      payload[name] = value === '' ? null : value;
    }
  }
  if (payload.age === undefined || Number.isNaN(payload.age)) {
    delete payload.age;
  }
  return payload;
}

export function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  return value;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function matchesDate(value, isoDate) {
  if (!value) return false;
  return String(value).slice(0, 10) === isoDate || String(value).includes(isoDate);
}

export function extractTime(patient) {
  if (patient?.appointment_time) return patient.appointment_time;
  const value = patient?.follow_up_1;
  if (!value) return '—';
  const match = String(value).match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/);
  return match ? match[1] : '—';
}

export function fullPhone(patient) {
  const code = (patient?.phone_country_code || DEFAULT_COUNTRY_CODE).replace(/\D/g, '');
  const num = (patient?.phone || '').replace(/\D/g, '');
  if (!num) return '';
  return `${code}${num}`;
}

export function whatsappUrl(patient, message = '') {
  const phone = fullPhone(patient);
  if (!phone) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${phone}${text}`;
}

export function smsUrl(patient, message = '') {
  const phone = fullPhone(patient);
  if (!phone) return null;
  const body = message ? `?body=${encodeURIComponent(message)}` : '';
  return `sms:+${phone}${body}`;
}

export function mailtoUrl(patient) {
  if (!patient?.email) return null;
  return `mailto:${patient.email}`;
}

export function filterPatientsByKeyword(patients, keyword) {
  if (!keyword?.trim()) return patients;
  const term = keyword.trim().toLowerCase();
  return patients.filter((p) =>
    [p.name, p.amax_id, p.phone, p.address, p.diagnosis, p.treatment, p.status, p.referral, p.email]
      .some((field) => field && String(field).toLowerCase().includes(term))
  );
}

export function filterPatientsByDateRange(patients, startDate, endDate) {
  return patients.filter((p) => {
    const d = String(p.date).slice(0, 10);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });
}

export function appointmentStatusClass(status) {
  if (!status) return '';
  return `badge badge-${String(status).toLowerCase().replace(/\s+/g, '-')}`;
}
