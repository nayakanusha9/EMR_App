import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Phone, MessageCircle, Trash2,
} from 'lucide-react';
import { patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import Fab from '../components/Fab';
import {
  displayValue,
  buildVisitsFromPatient,
} from '../utils/patientForm';

function DetailRow({ label, value, actions }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <div className="detail-value">
        <span>{displayValue(value)}</span>
        {actions && <div className="detail-actions">{actions}</div>}
      </div>
    </div>
  );
}

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPatient = () => {
    setLoading(true);
    patientsAPI.get(id)
      .then((res) => setPatient(res.data))
      .catch(() => navigate('/patients'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPatient(); }, [id]);

  const phone = patient?.phone?.replace(/\D/g, '');

  const phoneActions = phone ? (
    <>
      <a href={`tel:${patient.phone}`} className="icon-action" aria-label="Call">
        <Phone size={16} />
      </a>
      <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="icon-action" aria-label="WhatsApp">
        <MessageCircle size={16} />
      </a>
      <a href={`sms:${patient.phone}`} className="icon-action" aria-label="SMS">
        <MessageCircle size={16} />
      </a>
    </>
  ) : null;

  const handleUpdate = async (payload) => {
    setError('');
    setSubmitting(true);
    try {
      await patientsAPI.update(id, payload);
      setShowEdit(false);
      loadPatient();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await patientsAPI.delete(id);
      navigate('/patients');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete patient');
      setShowDelete(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (!patient) return null;

  const visits = buildVisitsFromPatient(patient);

  const infoFields = isDoctor
    ? [
        { label: 'AMAX ID', value: patient.amax_id },
        { label: 'Patient Name', value: patient.name },
        { label: 'Age', value: patient.age },
        { label: 'Phone', value: patient.phone, actions: phoneActions },
        { label: 'Address', value: patient.address },
        { label: 'Diagnosis', value: patient.diagnosis },
        { label: 'Laterality', value: patient.laterality },
        { label: 'Treatment', value: patient.treatment },
        { label: 'Status', value: patient.status },
        { label: 'Finance', value: patient.finance },
        { label: 'Follow Up 1', value: patient.follow_up_1 },
        { label: 'Remark 1', value: patient.remark_1 },
        { label: 'Follow Up 2', value: patient.follow_up_2 },
        { label: 'Remark 2', value: patient.remark_2 },
        { label: 'Referral', value: patient.referral },
        { label: 'Date', value: patient.date },
      ]
    : [
        { label: 'AMAX ID', value: patient.amax_id },
        { label: 'Patient Name', value: patient.name },
        { label: 'Age', value: patient.age },
        { label: 'Phone', value: patient.phone, actions: phoneActions },
        { label: 'Address', value: patient.address },
        { label: 'Follow Up 1', value: patient.follow_up_1 },
        { label: 'Follow Up 2', value: patient.follow_up_2 },
        { label: 'Date', value: patient.date },
      ];

  return (
    <div className="detail-page">
      <header className="detail-app-bar">
        <button type="button" className="app-bar-icon-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>{patient.name}</h1>
        <div className="detail-app-bar-actions">
          <button type="button" className="app-bar-icon-btn" onClick={() => setShowDelete(true)}>
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="page-container">
        <section className="card detail-section">
          <h3 className="card-title">Patient Information</h3>
          <div className="detail-list">
            {infoFields.map(({ label, value, actions }) => (
              <DetailRow key={label} label={label} value={value} actions={actions} />
            ))}
          </div>
        </section>

        <section className="card detail-section">
          <div className="section-header">
            <h3 className="card-title" style={{ marginBottom: 0 }}>Visits</h3>
            <span className="section-count">{visits.length}</span>
          </div>
          {visits.length === 0 ? (
            <div className="section-empty">No visit history.</div>
          ) : (
            <div className="visit-card-list">
              {visits.map((visit) => (
                <button
                  key={visit.id}
                  type="button"
                  className="visit-card"
                  onClick={() => navigate(`/patients/${id}/visits/${visit.id}`)}
                >
                  <div>
                    <div className="visit-card-date">{displayValue(visit.date)}</div>
                    <div className="visit-card-label">{visit.label}</div>
                    {isDoctor && (
                      <div className="visit-card-meta">
                        {displayValue(visit.diagnosis)} · {displayValue(visit.status)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <Fab variant="edit" onClick={() => setShowEdit(true)} label="Edit patient" />

      {showEdit && (
        <Modal title="Edit Patient" onClose={() => setShowEdit(false)}>
          <PatientForm
            isDoctor={isDoctor}
            patient={patient}
            onSubmit={handleUpdate}
            onCancel={() => setShowEdit(false)}
            submitting={submitting}
            error={error}
            submitLabel="Update Patient"
          />
        </Modal>
      )}

      {showDelete && (
        <Modal title="Delete Patient" onClose={() => setShowDelete(false)}>
          <p style={{ marginBottom: '1.25rem' }}>
            Are you sure you want to delete <strong>{patient.name}</strong>?
          </p>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
