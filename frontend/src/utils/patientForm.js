export const RECEPTIONIST_FORM_FIELDS = [
  { name: 'amax_id', label: 'AMAX ID', type: 'text', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'phone', label: 'Phone', type: 'text', required: false },
  { name: 'address', label: 'Address', type: 'textarea', required: false },
  { name: 'follow_up_1', label: 'Follow Up 1', type: 'text', required: false },
  { name: 'follow_up_2', label: 'Follow Up 2', type: 'text', required: false },
];

export const DOCTOR_FORM_FIELDS = [
  ...RECEPTIONIST_FORM_FIELDS.slice(0, 6),
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

export function emptyForm(isDoctor) {
  const fields = isDoctor ? DOCTOR_FORM_FIELDS : RECEPTIONIST_FORM_FIELDS;
  return fields.reduce((acc, { name }) => {
    acc[name] = '';
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
    address: patient.address ?? '',
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

export function buildPayload(form, isDoctor) {
  const fields = isDoctor ? DOCTOR_FORM_FIELDS : RECEPTIONIST_FORM_FIELDS;
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

export function extractTime(value) {
  if (!value) return '—';
  const match = String(value).match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/);
  return match ? match[1] : '—';
}

export function buildVisitsFromPatient(patient) {
  if (!patient) return [];
  const visits = [
    {
      id: 'primary',
      date: patient.date,
      diagnosis: patient.diagnosis,
      treatment: patient.treatment,
      status: patient.status,
      label: 'Registration Visit',
    },
  ];
  if (patient.follow_up_1) {
    visits.push({
      id: 'fu1',
      date: patient.follow_up_1,
      diagnosis: patient.diagnosis,
      treatment: patient.treatment,
      status: patient.status,
      remark: patient.remark_1,
      label: 'Follow Up 1',
    });
  }
  if (patient.follow_up_2) {
    visits.push({
      id: 'fu2',
      date: patient.follow_up_2,
      diagnosis: patient.diagnosis,
      treatment: patient.treatment,
      status: patient.status,
      remark: patient.remark_2,
      label: 'Follow Up 2',
    });
  }
  return visits;
}

export function filterPatientsByKeyword(patients, keyword) {
  if (!keyword?.trim()) return patients;
  const term = keyword.trim().toLowerCase();
  return patients.filter((p) =>
    [p.name, p.amax_id, p.phone, p.address, p.diagnosis, p.treatment, p.status, p.referral]
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
