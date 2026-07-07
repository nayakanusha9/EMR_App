import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { patientsAPI, visitsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { displayValue } from '../utils/patientForm';

export default function VisitDetails() {
  const { id, visitId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [visit, setVisit] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([patientsAPI.get(id), visitsAPI.get(id, visitId)])
      .then(([patientRes, visitRes]) => {
        setPatient(patientRes.data);
        setVisit(visitRes.data);
      })
      .catch(() => navigate(`/patients/${id}`, { replace: true }))
      .finally(() => setLoading(false));
  }, [id, visitId, navigate]);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (!visit || !patient) return null;

  const fields = [
    { label: 'Patient Name', value: patient.name },
    { label: 'AMAX ID', value: patient.amax_id },
    { label: 'Visit', value: `Visit ${visit.visit_number}` },
    { label: 'Visit Date', value: visit.visit_date },
    { label: 'Visit Time', value: visit.visit_time },
    ...(isDoctor ? [
      { label: 'Diagnosis', value: visit.diagnosis },
      { label: 'Prescription', value: visit.prescription },
      { label: 'Notes', value: visit.notes },
      { label: 'Follow-up Remarks', value: visit.follow_up_remarks },
    ] : [
      { label: 'Notes', value: visit.notes },
    ]),
  ];

  return (
    <div className="detail-page">
      <header className="detail-app-bar">
        <button type="button" className="app-bar-icon-btn" onClick={() => navigate(`/patients/${id}`, { replace: false })}>
          <ArrowLeft size={22} />
        </button>
        <h1>Visit {visit.visit_number}</h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="page-container">
        <section className="card detail-section">
          <div className="detail-list">
            {fields.map(({ label, value }) => (
              <div key={label} className="detail-row">
                <span className="detail-label">{label}</span>
                <span className="detail-value">{displayValue(value)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
