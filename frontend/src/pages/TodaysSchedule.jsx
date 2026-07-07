import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import AppointmentForm from '../components/AppointmentForm';
import Fab from '../components/Fab';
import {
  todayISO,
  matchesDate,
  extractTime,
  appointmentStatusClass,
  APPOINTMENT_FORM_FIELDS,
  DOCTOR_APPOINTMENT_FORM_FIELDS,
} from '../utils/patientForm';

function ScheduleItem({ patient, onClick }) {
  const statusClass = appointmentStatusClass(patient.appointment_status || patient.status);

  return (
    <button type="button" className="schedule-item" onClick={onClick}>
      <div className="schedule-item-main">
        <div className="schedule-item-name">{patient.name}</div>
        <div className="schedule-item-meta">
          <span>{patient.amax_id}</span>
          <span>{extractTime(patient)}</span>
          {patient.patient_type && <span>{patient.patient_type}</span>}
          {(patient.appointment_status || patient.status) && (
            <span className={statusClass}>{patient.appointment_status || patient.status}</span>
          )}
        </div>
      </div>
      <ChevronRight size={18} />
    </button>
  );
}

export default function TodaysSchedule() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const today = todayISO();
  const appointmentFields = isDoctor ? DOCTOR_APPOINTMENT_FORM_FIELDS : APPOINTMENT_FORM_FIELDS;

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('appointment');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPatients = useCallback(() => {
    setLoading(true);
    patientsAPI.list({ limit: 100, sort_by: 'date', sort_order: 'desc' })
      .then((res) => setPatients(res.data.patients))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  useEffect(() => {
    const form = searchParams.get('form');
    if (form === 'appointment' || form === 'schedule') {
      setFormMode(form);
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const appointmentsToday = patients.filter((p) => matchesDate(p.date, today));
  const scheduleToday = patients.filter(
    (p) => matchesDate(p.date, today) && ['Scheduled', 'Confirmed', 'Checked-In'].includes(p.appointment_status || '')
  );

  const openForm = (mode) => {
    setFormMode(mode);
    setShowForm(true);
  };

  const handleSubmit = async (payload) => {
    setError('');
    setSubmitting(true);
    try {
      await patientsAPI.create(payload);
      setShowForm(false);
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const formTitle = formMode === 'appointment' ? 'Appointment Entry' : 'Schedule Entry';

  return (
    <div className="page-container schedule-page">
      <div className="page-header">
        <div>
          <h2>Today&apos;s Schedule</h2>
          <p>{today}</p>
        </div>
      </div>

      <section className="schedule-section card">
        <div className="section-header">
          <h3>Appointments Today</h3>
          <span className="section-count">{appointmentsToday.length}</span>
        </div>
        {loading ? (
          <p className="section-loading">Loading...</p>
        ) : appointmentsToday.length === 0 ? (
          <div className="section-empty">No items.</div>
        ) : (
          <div className="schedule-list">
            {appointmentsToday.map((p) => (
              <ScheduleItem key={p.id} patient={p} onClick={() => navigate(`/patients/${p.id}`)} />
            ))}
          </div>
        )}
        <Fab onClick={() => openForm('appointment')} label="Add appointment" />
      </section>

      <section className="schedule-section card">
        <div className="section-header">
          <h3>Today&apos;s Schedule</h3>
          <span className="section-count">{scheduleToday.length}</span>
        </div>
        {loading ? (
          <p className="section-loading">Loading...</p>
        ) : scheduleToday.length === 0 ? (
          <div className="section-empty">No items.</div>
        ) : (
          <div className="schedule-list">
            {scheduleToday.map((p) => (
              <ScheduleItem key={`sched-${p.id}`} patient={p} onClick={() => navigate(`/patients/${p.id}`)} />
            ))}
          </div>
        )}
        <Fab onClick={() => openForm('schedule')} label="Add schedule entry" />
      </section>

      {showForm && (
        <Modal title={formTitle} onClose={() => setShowForm(false)}>
          <AppointmentForm
            isDoctor={isDoctor}
            formFields={appointmentFields}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
            error={error}
            submitLabel="Save"
            defaultDate={today}
          />
        </Modal>
      )}
    </div>
  );
}
