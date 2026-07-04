import { ChevronRight } from 'lucide-react';
import { displayValue } from '../utils/patientForm';

export default function PatientCard({ patient, onClick, compact = false }) {
  const statusClass = patient.status
    ? `badge badge-${String(patient.status).toLowerCase().replace(/\s+/g, '-')}`
    : '';

  if (compact) {
    return (
      <button type="button" className="patient-card patient-card-compact" onClick={onClick}>
        <div className="patient-card-body">
          <div className="patient-card-name">{patient.name}</div>
          <div className="patient-card-meta">
            <span>{patient.amax_id}</span>
            {patient.status && <span className={statusClass}>{patient.status}</span>}
          </div>
        </div>
        <ChevronRight size={18} className="patient-card-arrow" />
      </button>
    );
  }

  return (
    <button type="button" className="patient-card" onClick={onClick}>
      <div className="patient-card-body">
        <div className="patient-card-header">
          <div className="patient-card-name">{patient.name}</div>
          {patient.status && <span className={statusClass}>{patient.status}</span>}
        </div>
        <div className="patient-card-details">
          <div><span className="label">AMAX ID</span> {displayValue(patient.amax_id)}</div>
          <div><span className="label">Age</span> {displayValue(patient.age)}</div>
          <div><span className="label">Phone</span> {displayValue(patient.phone)}</div>
          <div><span className="label">Last Visit</span> {displayValue(patient.date)}</div>
        </div>
      </div>
      <ChevronRight size={18} className="patient-card-arrow" />
    </button>
  );
}
