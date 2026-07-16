import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Phone, Trash2, Plus, CalendarPlus,
} from 'lucide-react';
import { patientsAPI, visitsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import AppointmentForm from '../components/AppointmentForm';
import VisitForm from '../components/VisitForm';
import Fab from '../components/Fab';
import PatientContactIcons from '../components/PatientContactIcons';
import {
  displayValue,
  APPOINTMENT_FORM_FIELDS,
  DOCTOR_APPOINTMENT_FORM_FIELDS,
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
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [showBookAppointment, setShowBookAppointment] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([patientsAPI.get(id), visitsAPI.list(id)])
      .then(([patientRes, visitsRes]) => {
        setPatient(patientRes.data);
        setVisits(visitsRes.data);
      })
      .catch(() => navigate('/patients', { replace: true }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  const phoneActions = patient?.phone ? (
    <>
      <a href={`tel:${patient.phone}`} className="icon-action" aria-label="Call"><Phone size={16} /></a>
      <PatientContactIcons patient={patient} size={16} />
    </>
  ) : null;

  const handleUpdate = async (payload) => {
    setError('');
    setSubmitting(true);
    try {
      await patientsAPI.update(id, payload);
      setShowEdit(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewVisit = async (payload) => {
    setError('');
    setSubmitting(true);
    try {
      await visitsAPI.create(id, payload);
      setShowNewVisit(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create visit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookAppointment = async (payload) => {
    setError('');
    setSubmitting(true);
    try {
      await patientsAPI.update(id, payload);
      setShowBookAppointment(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await patientsAPI.delete(id);
      navigate('/patients', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete patient');
      setShowDelete(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (!patient) return null;

  const appointmentFields = isDoctor ? DOCTOR_APPOINTMENT_FORM_FIELDS : APPOINTMENT_FORM_FIELDS;

  const infoFields = isDoctor
    ? [
        { label: 'AMAX ID', value: patient.amax_id },
        { label: 'Patient Name', value: patient.name },
        { label: 'Age', value: patient.age },
        { label: 'Phone', value: patient.phone, actions: phoneActions },
        { label: 'Alternative Phone Number', value: patient.alternative_phone },
        { label: 'Email', value: patient.email },
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
        { label: 'Patient Type', value: patient.patient_type },
        { label: 'Appointment Status', value: patient.appointment_status },
        { label: 'Appointment Time', value: patient.appointment_time },
        { label: 'Date', value: patient.date },
      ]
    : [
        { label: 'AMAX ID', value: patient.amax_id },
        { label: 'Patient Name', value: patient.name },
        { label: 'Age', value: patient.age },
        { label: 'Phone', value: patient.phone, actions: phoneActions },
        { label: 'Alternative Phone Number', value: patient.alternative_phone },
        { label: 'Email', value: patient.email },
        { label: 'Address', value: patient.address },
        { label: 'Patient Type', value: patient.patient_type },
        { label: 'Appointment Status', value: patient.appointment_status },
        { label: 'Appointment Time', value: patient.appointment_time },
        { label: 'Date', value: patient.date },
      ];

  return (
    <div className="detail-page">
      <header className="detail-app-bar">
        <button type="button" className="app-bar-icon-btn" onClick={() => navigate('/patients', { replace: false })}>
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
        <div className="quick-actions">
          <button type="button" className="quick-action-btn" onClick={() => { setError(''); setShowNewVisit(true); }}>
            <Plus size={22} />
            <span>New Visit</span>
          </button>
          <button type="button" className="quick-action-btn" onClick={() => { setError(''); setShowBookAppointment(true); }}>
            <CalendarPlus size={22} />
            <span>Book Appointment</span>
          </button>
        </div>

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
                    <div className="visit-card-date">Visit {visit.visit_number}</div>
                    <div className="visit-card-label">Date: {displayValue(visit.visit_date)}</div>
                    <div className="visit-card-label">Time: {displayValue(visit.visit_time)}</div>
                    {isDoctor && (
                      <div className="visit-card-meta">
                        {displayValue(visit.diagnosis)} · {displayValue(visit.prescription)}
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
          <PatientForm isDoctor={isDoctor} patient={patient} onSubmit={handleUpdate} onCancel={() => setShowEdit(false)} submitting={submitting} error={error} submitLabel="Update Patient" />
        </Modal>
      )}

      {showNewVisit && (
        <Modal title="New Visit" onClose={() => setShowNewVisit(false)}>
          <VisitForm patient={patient} onSubmit={handleNewVisit} onCancel={() => setShowNewVisit(false)} submitting={submitting} error={error} />
        </Modal>
      )}

      {showBookAppointment && (
        <Modal title="Book Appointment" onClose={() => setShowBookAppointment(false)}>
          <AppointmentForm isDoctor={isDoctor} patient={patient} formFields={appointmentFields} onSubmit={handleBookAppointment} onCancel={() => setShowBookAppointment(false)} submitting={submitting} error={error} submitLabel="Book Appointment" />
        </Modal>
      )}

      {showDelete && (
        <Modal title="Delete Patient" onClose={() => setShowDelete(false)}>
          <p style={{ marginBottom: '1.25rem' }}>Are you sure you want to delete <strong>{patient.name}</strong>?</p>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleDelete} disabled={submitting}>{submitting ? 'Deleting...' : 'Delete'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
