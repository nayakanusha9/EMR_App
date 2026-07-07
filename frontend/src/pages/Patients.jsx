import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import PatientContactIcons from '../components/PatientContactIcons';
import { displayValue } from '../utils/patientForm';

const PAGE_SIZE = 20;

export default function Patients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPatients = useCallback(() => {
    setLoading(true);
    patientsAPI.list({
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      sort_by: 'sl_no',
      sort_order: 'asc',
    })
      .then((res) => {
        setPatients(res.data.patients);
        setTotal(res.data.total);
        setSelected(new Set());
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const selectedCount = selected.size;

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === patients.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(patients.map((p) => p.id)));
    }
  };

  const handleCreate = async (payload) => {
    setError('');
    setSubmitting(true);
    try {
      await patientsAPI.create(payload);
      setShowModal(false);
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    setError('');
    setSubmitting(true);
    try {
      await patientsAPI.update(editPatient.id, payload);
      setEditPatient(null);
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    setSubmitting(true);
    try {
      await patientsAPI.bulkDelete([...selected]);
      setShowDeleteConfirm(false);
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete patients');
      setShowDeleteConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = () => {
    if (selectedCount !== 1) return;
    const id = [...selected][0];
    const patient = patients.find((p) => p.id === id);
    setEditPatient(patient);
    setError('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Patients</h2>
          <p>{total} registered patient{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true); }}>
          <Plus size={18} /> Add Patient
        </button>
      </div>

      {selectedCount > 0 && (
        <div className="selection-toolbar card">
          <span>{selectedCount} selected</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={selectedCount !== 1}
              onClick={openEdit}
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : patients.length === 0 ? (
        <div className="card empty-state">No patients found. Add your first patient.</div>
      ) : (
        <>
          <div className="card patient-list-table">
            <div className="patient-list-header">
              <input
                type="checkbox"
                checked={selected.size === patients.length && patients.length > 0}
                onChange={toggleSelectAll}
                aria-label="Select all"
              />
              <span>Name</span>
              <span>Age</span>
              <span>Diagnosis</span>
              <span>Patient ID</span>
              <span>Actions</span>
            </div>
            {patients.map((p) => (
              <div
                key={p.id}
                className="patient-list-row"
                onClick={() => navigate(`/patients/${p.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/patients/${p.id}`)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={(e) => toggleSelect(p.id, e)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${p.name}`}
                />
                <span className="patient-list-name">{p.name}</span>
                <span>{displayValue(p.age)}</span>
                <span>{displayValue(isDoctor ? p.diagnosis : '—')}</span>
                <span><strong>{p.amax_id}</strong></span>
                <PatientContactIcons patient={p} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="form-actions" style={{ marginTop: '1rem', justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Page {page + 1} of {totalPages}</span>
              <button type="button" className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <Modal title="Add New Patient" onClose={() => setShowModal(false)}>
          <PatientForm isDoctor={isDoctor} onSubmit={handleCreate} onCancel={() => setShowModal(false)} submitting={submitting} error={error} submitLabel="Add Patient" />
        </Modal>
      )}

      {editPatient && (
        <Modal title="Edit Patient" onClose={() => setEditPatient(null)}>
          <PatientForm isDoctor={isDoctor} patient={editPatient} onSubmit={handleUpdate} onCancel={() => setEditPatient(null)} submitting={submitting} error={error} submitLabel="Update Patient" />
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal title="Delete Patients" onClose={() => setShowDeleteConfirm(false)}>
          <p style={{ marginBottom: '1.25rem' }}>
            Are you sure you want to delete {selectedCount} patient{selectedCount !== 1 ? 's' : ''}? This cannot be undone.
          </p>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleBulkDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
