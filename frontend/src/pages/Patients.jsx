import { useCallback, useEffect, useState } from 'react';
import { Plus, Search as SearchIcon, Pencil, Trash2 } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const PAGE_SIZE = 20;

const RECEPTIONIST_COLUMNS = [
  { key: 'sl_no', label: 'SL NO', sortable: true },
  { key: 'amax_id', label: 'AMAX ID', sortable: true },
  { key: 'date', label: 'DATE', sortable: true },
  { key: 'name', label: 'NAME', sortable: true },
  { key: 'age', label: 'AGE', sortable: true },
  { key: 'phone', label: 'PHONE', sortable: true },
  { key: 'address', label: 'ADDRESS', sortable: false },
  { key: 'follow_up_1', label: 'FOLLOW UP 1', sortable: false },
  { key: 'follow_up_2', label: 'FOLLOW UP 2', sortable: false },
];

const DOCTOR_COLUMNS = [
  { key: 'sl_no', label: 'SL NO', sortable: true },
  { key: 'amax_id', label: 'AMAX ID', sortable: true },
  { key: 'date', label: 'DATE', sortable: true },
  { key: 'name', label: 'NAME', sortable: true },
  { key: 'age', label: 'AGE', sortable: true },
  { key: 'phone', label: 'PHONE', sortable: true },
  { key: 'address', label: 'ADDRESS', sortable: false },
  { key: 'diagnosis', label: 'DIAGNOSIS', sortable: false },
  { key: 'laterality', label: 'LATERALITY', sortable: false },
  { key: 'treatment', label: 'TREATMENT', sortable: false },
  { key: 'status', label: 'STATUS', sortable: false },
  { key: 'finance', label: 'FINANCE', sortable: false },
  { key: 'follow_up_1', label: 'FU 1', sortable: false },
  { key: 'remark_1', label: 'REMARK', sortable: false },
  { key: 'follow_up_2', label: 'FU 2', sortable: false },
  { key: 'remark_2', label: 'REMARK', sortable: false },
  { key: 'referral', label: 'REFERRAL', sortable: false },
];

const RECEPTIONIST_FORM_FIELDS = [
  { name: 'amax_id', label: 'AMAX ID', type: 'text', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'age', label: 'Age', type: 'number', required: true },
  { name: 'phone', label: 'Phone', type: 'text', required: false },
  { name: 'address', label: 'Address', type: 'textarea', required: false },
  { name: 'follow_up_1', label: 'Follow Up 1', type: 'text', required: false },
  { name: 'follow_up_2', label: 'Follow Up 2', type: 'text', required: false },
];

const DOCTOR_FORM_FIELDS = [
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

function emptyForm(isDoctor) {
  const fields = isDoctor ? DOCTOR_FORM_FIELDS : RECEPTIONIST_FORM_FIELDS;
  return fields.reduce((acc, { name, type }) => {
    acc[name] = type === 'number' ? '' : '';
    return acc;
  }, {});
}

function patientToForm(patient) {
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

function buildPayload(form, isDoctor) {
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

function cellValue(patient, key) {
  const value = patient[key];
  if (value === null || value === undefined || value === '') return '—';
  return value;
}

export default function Patients() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const columns = isDoctor ? DOCTOR_COLUMNS : RECEPTIONIST_COLUMNS;
  const formFields = isDoctor ? DOCTOR_FORM_FIELDS : RECEPTIONIST_FORM_FIELDS;

  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('sl_no');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState(emptyForm(isDoctor));
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPatients = useCallback(() => {
    setLoading(true);
    patientsAPI.list({
      q: activeQuery || undefined,
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      sort_by: sortBy,
      sort_order: sortOrder,
    })
      .then((res) => {
        setPatients(res.data.patients);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [activeQuery, page, sortBy, sortOrder]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    setForm(emptyForm(isDoctor));
  }, [isDoctor]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setActiveQuery(searchQuery.trim());
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setForm(emptyForm(isDoctor));
    setError('');
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setForm(patientToForm(patient));
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPatient(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = buildPayload(form, isDoctor);
      if (editingPatient) {
        await patientsAPI.update(editingPatient.id, payload);
      } else {
        await patientsAPI.create(payload);
      }
      closeModal();
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await patientsAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      if (patients.length === 1 && page > 0) {
        setPage((p) => p - 1);
      } else {
        loadPatients();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete patient');
      setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const sortIndicator = (key) => {
    if (sortBy !== key) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Patients</h2>
          <p>{total} registered patient{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Patient
        </button>
      </div>

      <div className="card">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name, AMAX ID, phone, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <SearchIcon size={18} /> Search
          </button>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            {activeQuery ? 'No patients match your search.' : 'No patients found. Add your first patient.'}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {columns.map(({ key, label, sortable }) => (
                      <th
                        key={key}
                        onClick={sortable ? () => handleSort(key) : undefined}
                        style={sortable ? { cursor: 'pointer' } : undefined}
                      >
                        {label}{sortable ? sortIndicator(key) : ''}
                      </th>
                    ))}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      {columns.map(({ key }) => (
                        <td key={key}>
                          {key === 'sl_no' || key === 'amax_id' ? (
                            <strong>{cellValue(p, key)}</strong>
                          ) : (
                            cellValue(p, key)
                          )}
                        </td>
                      ))}
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(p)}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="form-actions" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <Modal
          title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
          onClose={closeModal}
        >
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
                    <textarea name={name} value={form[name] ?? ''} onChange={handleChange} required={required} />
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
                {submitting ? 'Saving...' : editingPatient ? 'Update Patient' : 'Add Patient'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Patient" onClose={() => setDeleteTarget(null)}>
          <p style={{ marginBottom: '1.25rem' }}>
            Are you sure you want to delete patient <strong>{deleteTarget.name}</strong> (AMAX ID: {deleteTarget.amax_id})?
          </p>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
