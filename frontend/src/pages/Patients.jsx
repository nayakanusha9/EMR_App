import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import PatientCard from '../components/PatientCard';

const PAGE_SIZE = 20;

export default function Patients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
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
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSubmit = async (payload) => {
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Patients</h2>
          <p>{total} registered patient{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Patient
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : patients.length === 0 ? (
        <div className="card empty-state">No patients found. Add your first patient.</div>
      ) : (
        <>
          <div className="patient-card-list">
            {patients.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                onClick={() => navigate(`/patients/${p.id}`)}
              />
            ))}
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

      {showModal && (
        <Modal title="Add New Patient" onClose={() => setShowModal(false)}>
          <PatientForm
            isDoctor={isDoctor}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
            submitting={submitting}
            error={error}
            submitLabel="Add Patient"
          />
        </Modal>
      )}
    </div>
  );
}
