import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { displayValue, buildVisitsFromPatient } from '../utils/patientForm';

export default function VisitDetails() {
  const { id, visitId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [visit, setVisit] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientsAPI.get(id)
      .then((res) => {
        setPatient(res.data);
        const visits = buildVisitsFromPatient(res.data);
        const found = visits.find((v) => v.id === visitId);
        if (found) {
          setVisit(found);
        } else {
          navigate(`/patients/${id}`);
        }
      })
      .catch(() => navigate('/patients'))
      .finally(() => setLoading(false));
  }, [id, visitId, navigate]);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (!visit || !patient) return null;

  const fields = [
    { label: 'Patient Name', value: patient.name },
    { label: 'AMAX ID', value: patient.amax_id },
    { label: 'Visit Date', value: visit.date },
    { label: 'Visit Type', value: visit.label },
    ...(isDoctor ? [
      { label: 'Diagnosis', value: visit.diagnosis },
      { label: 'Treatment', value: visit.treatment },
      { label: 'Status', value: visit.status },
      { label: 'Remark', value: visit.remark },
    ] : []),
  ];

  return (
    <div className="detail-page">
      <header className="detail-app-bar">
        <button type="button" className="app-bar-icon-btn" onClick={() => navigate(`/patients/${id}`)}>
          <ArrowLeft size={22} />
        </button>
        <h1>Visit Details</h1>
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
