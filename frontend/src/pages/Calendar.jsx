import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { patientsAPI } from '../services/api';
import Modal from '../components/Modal';
import { extractTime, displayValue, appointmentStatusClass, whatsappUrl } from '../utils/patientForm';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  useEffect(() => {
    patientsAPI.list({ limit: 100, sort_by: 'date', sort_order: 'desc' })
      .then((res) => setPatients(res.data.patients))
      .finally(() => setLoading(false));
  }, []);

  const patientsByDate = useMemo(() => {
    const map = {};
    for (const p of patients) {
      const d = String(p.date).slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(p);
    }
    return map;
  }, [patients]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const selectedAppointments = patientsByDate[selectedDate] || [];

  const handleBroadcast = () => {
    const withPhone = selectedAppointments.filter((p) => whatsappUrl(p));
    if (withPhone.length === 0) return;
    withPhone.forEach((p, index) => {
      const url = whatsappUrl(p, broadcastMessage);
      setTimeout(() => window.open(url, '_blank'), index * 800);
    });
    setShowBroadcast(false);
    setBroadcastMessage('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Calendar</h2>
          <p>View appointments by date</p>
        </div>
      </div>

      <div className="card calendar-card">
        <div className="calendar-nav">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
            <ChevronLeft size={16} />
          </button>
          <h3>{MONTHS[month]} {year}</h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="calendar-grid">
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="calendar-day empty" />;
            const iso = toISO(year, month, day);
            const hasEvents = patientsByDate[iso]?.length > 0;
            const isSelected = iso === selectedDate;
            const isToday = iso === today.toISOString().slice(0, 10);
            return (
              <button
                key={iso}
                type="button"
                className={`calendar-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}${hasEvents ? ' has-events' : ''}`}
                onClick={() => setSelectedDate(iso)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <section className="card" style={{ marginTop: '1.25rem' }}>
        <div className="section-header">
          <h3 className="card-title" style={{ marginBottom: 0 }}>
            Appointments — {selectedDate}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="section-count">{selectedAppointments.length}</span>
            {selectedAppointments.length > 1 && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowBroadcast(true)}>
                Broadcast WhatsApp
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : selectedAppointments.length === 0 ? (
          <div className="section-empty">No appointments for this date.</div>
        ) : (
          <div className="schedule-list">
            {selectedAppointments.map((p) => (
              <button
                key={p.id}
                type="button"
                className="schedule-item"
                onClick={() => navigate(`/patients/${p.id}`)}
              >
                <div className="schedule-item-main">
                  <div className="schedule-item-name">{p.name}</div>
                  <div className="schedule-item-meta">
                    <span>{p.amax_id}</span>
                    <span>{extractTime(p)}</span>
                    {p.patient_type && <span>{p.patient_type}</span>}
                    <span className={appointmentStatusClass(p.appointment_status)}>
                      {displayValue(p.appointment_status)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {showBroadcast && (
        <Modal title="Broadcast WhatsApp" onClose={() => setShowBroadcast(false)}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Send the same message to {selectedAppointments.filter((p) => whatsappUrl(p)).length} patient(s) with phone numbers.
          </p>
          <div className="form-group">
            <label>Message</label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Enter your message..."
              rows={4}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleBroadcast}>Send via WhatsApp</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowBroadcast(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
